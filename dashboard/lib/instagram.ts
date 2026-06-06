// Instagram Graph API クライアント。
// サーバー側でのみ使用すること（アクセストークンをブラウザに渡さない）。
//
// 必要な env:
//   IG_ACCESS_TOKEN        … 長期 or システムユーザートークン
//   IG_BUSINESS_ACCOUNT_ID … IG ビジネスアカウントID（数値）
//   IG_COMPETITORS         … 競合のユーザー名（カンマ区切り・任意）
//
// Graph API はバージョンやメディア種別でメトリクスの可用性が変わるため、
// insights 系は小さく分割して取得し、失敗したメトリクスは握りつぶして
// 取得できた分だけ返す（部分返却）方針。

const API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

function token(): string {
  const t = process.env.IG_ACCESS_TOKEN;
  if (!t) throw new Error("IG_ACCESS_TOKEN が未設定です（README の手順でトークンを取得してください）");
  return t;
}

function accountId(): string {
  const id = process.env.IG_BUSINESS_ACCOUNT_ID;
  if (!id) throw new Error("IG_BUSINESS_ACCOUNT_ID が未設定です");
  return id;
}

export function competitorUsernames(): string[] {
  return (process.env.IG_COMPETITORS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

type GraphError = { error?: { message: string; code?: number; type?: string } };

// 任意の Graph API GET。path は先頭スラッシュなし（例 "17841400000000000/media"）。
async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", token());

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = (await res.json()) as T & GraphError;

  if (!res.ok || json.error) {
    const e = json.error;
    const code = e?.code;
    // トークン期限切れ / 認証エラーは分かりやすい日本語で。
    if (code === 190) {
      throw new Error("Instagram トークンが無効か期限切れです（再取得が必要）");
    }
    if (res.status === 429 || code === 4 || code === 17 || code === 32) {
      throw new Error("Instagram API のレート制限に達しました。時間をおいて再試行してください");
    }
    throw new Error(`Instagram API エラー ${res.status}: ${e?.message ?? "不明なエラー"}`);
  }
  return json;
}

// insights を「失敗しても落とさない」形で取得するヘルパー。
async function graphGetSafe<T>(
  path: string,
  params: Record<string, string>
): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await graphGet<T>(path, params), error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "取得失敗" };
  }
}

// ---- アカウント基本情報 ----

export type IgAccount = {
  username: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
  profilePictureUrl: string | null;
};

export async function fetchAccount(): Promise<IgAccount> {
  type Raw = {
    username: string;
    followers_count: number;
    follows_count: number;
    media_count: number;
    profile_picture_url?: string;
  };
  const r = await graphGet<Raw>(accountId(), {
    fields: "username,followers_count,follows_count,media_count,profile_picture_url",
  });
  return {
    username: r.username,
    followersCount: r.followers_count ?? 0,
    followsCount: r.follows_count ?? 0,
    mediaCount: r.media_count ?? 0,
    profilePictureUrl: r.profile_picture_url ?? null,
  };
}

// ---- アカウントインサイト ----

type InsightsResponse = {
  data: Array<{
    name: string;
    period: string;
    values?: Array<{ value: number | Record<string, number>; end_time?: string }>;
    total_value?: { value: number };
  }>;
};

export type DailyValue = { date: string; value: number };

export type AccountInsights = {
  // 日次の時系列（reach / 新規フォロー）
  reachDaily: DailyValue[];
  followerCountDaily: DailyValue[];
  // 期間合計
  profileViews: number | null;
  websiteClicks: number | null;
  accountsEngaged: number | null;
  totalInteractions: number | null;
  warnings: string[];
};

// since/until は UNIX 秒（文字列）。
export async function fetchAccountInsights(sinceUnix: number, untilUnix: number): Promise<AccountInsights> {
  const id = accountId();
  const since = String(sinceUnix);
  const until = String(untilUnix);
  const warnings: string[] = [];

  // 1) 日次時系列（period=day で時系列が返るメトリクス）
  const daily = await graphGetSafe<InsightsResponse>(`${id}/insights`, {
    metric: "reach",
    period: "day",
    since,
    until,
  });
  // follower_count は直近30日のみ・period=day。別途取得（範囲外なら空）。
  const fc = await graphGetSafe<InsightsResponse>(`${id}/insights`, {
    metric: "follower_count",
    period: "day",
    since,
    until,
  });

  const reachDaily = seriesOf(daily.data, "reach");
  const followerCountDaily = seriesOf(fc.data, "follower_count");
  if (daily.error) warnings.push(`reach: ${daily.error}`);
  if (fc.error) warnings.push(`follower_count: ${fc.error}`);

  // 2) 期間合計（新しめの API は metric_type=total_value が必要）
  const totals = await graphGetSafe<InsightsResponse>(`${id}/insights`, {
    metric: "profile_views,website_clicks,accounts_engaged,total_interactions",
    period: "day",
    metric_type: "total_value",
    since,
    until,
  });
  if (totals.error) warnings.push(`totals: ${totals.error}`);
  const totalMap = totalValueMap(totals.data);

  return {
    reachDaily,
    followerCountDaily,
    profileViews: totalMap.profile_views ?? null,
    websiteClicks: totalMap.website_clicks ?? null,
    accountsEngaged: totalMap.accounts_engaged ?? null,
    totalInteractions: totalMap.total_interactions ?? null,
    warnings,
  };
}

function seriesOf(resp: InsightsResponse | null, name: string): DailyValue[] {
  const metric = resp?.data?.find((d) => d.name === name);
  if (!metric?.values) return [];
  return metric.values
    .filter((v) => typeof v.value === "number" && v.end_time)
    .map((v) => ({ date: (v.end_time as string).slice(0, 10), value: v.value as number }));
}

function totalValueMap(resp: InsightsResponse | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of resp?.data ?? []) {
    if (d.total_value && typeof d.total_value.value === "number") out[d.name] = d.total_value.value;
    else if (d.values?.[0] && typeof d.values[0].value === "number") out[d.name] = d.values[0].value as number;
  }
  return out;
}

// ---- フォロワー人口統計（要フォロワー≥100） ----

export type Demographics = {
  age: Record<string, number>;
  gender: Record<string, number>;
  city: Record<string, number>;
  country: Record<string, number>;
  available: boolean;
  note: string | null;
};

export async function fetchFollowerDemographics(): Promise<Demographics> {
  const id = accountId();
  const breakdowns = ["age", "gender", "city", "country"] as const;
  const out: Demographics = { age: {}, gender: {}, city: {}, country: {}, available: false, note: null };

  for (const breakdown of breakdowns) {
    const r = await graphGetSafe<{
      data: Array<{ total_value?: { breakdowns?: Array<{ results: Array<{ dimension_values: string[]; value: number }> }> } }>;
    }>(`${id}/insights`, {
      metric: "follower_demographics",
      period: "lifetime",
      metric_type: "total_value",
      timeframe: "last_30_days",
      breakdown,
    });
    const results = r.data?.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
    for (const row of results) {
      const key = row.dimension_values?.[0] ?? "不明";
      out[breakdown][key] = row.value;
    }
    if (results.length > 0) out.available = true;
    if (r.error && !out.note) out.note = r.error;
  }
  if (!out.available && !out.note) out.note = "人口統計はフォロワー100人以上で取得できます";
  return out;
}

// ---- メディア（投稿）と投稿別インサイト ----

export type MediaItem = {
  id: string;
  caption: string;
  mediaType: string; // IMAGE | VIDEO | CAROUSEL_ALBUM
  productType: string; // FEED | REELS | STORY 等
  timestamp: string;
  permalink: string;
  likeCount: number;
  commentsCount: number;
  // insights（取得できた分のみ）
  reach: number | null;
  saved: number | null;
  shares: number | null;
  totalInteractions: number | null;
  views: number | null;
};

export async function fetchMedia(limit = 50): Promise<MediaItem[]> {
  type RawMedia = {
    data: Array<{
      id: string;
      caption?: string;
      media_type: string;
      media_product_type?: string;
      timestamp: string;
      permalink: string;
      like_count?: number;
      comments_count?: number;
    }>;
  };
  const raw = await graphGet<RawMedia>(`${accountId()}/media`, {
    fields: "id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count",
    limit: String(limit),
  });

  const items: MediaItem[] = [];
  for (const m of raw.data) {
    const isReel = (m.media_product_type ?? "") === "REELS";
    // 投稿種別ごとに有効なメトリクスが異なる。基本セット＋リールは views。
    const metrics = isReel
      ? "reach,saved,shares,total_interactions,views"
      : "reach,saved,shares,total_interactions";
    const ins = await graphGetSafe<InsightsResponse>(`${m.id}/insights`, { metric: metrics });
    const map = totalValueMap(ins.data);

    items.push({
      id: m.id,
      caption: m.caption ?? "",
      mediaType: m.media_type,
      productType: m.media_product_type ?? "FEED",
      timestamp: m.timestamp,
      permalink: m.permalink,
      likeCount: m.like_count ?? 0,
      commentsCount: m.comments_count ?? 0,
      reach: numOrNull(map.reach),
      saved: numOrNull(map.saved),
      shares: numOrNull(map.shares),
      totalInteractions: numOrNull(map.total_interactions),
      views: numOrNull(map.views),
    });
  }
  return items;
}

function numOrNull(v: number | undefined): number | null {
  return typeof v === "number" ? v : null;
}

// ---- 競合（business_discovery）----
// 取得できるのは公開情報のみ: followers_count, media_count, 各投稿の like/comment。
// reach・保存・インプレッションは他社分は取得不可。

export type CompetitorData = {
  username: string;
  followersCount: number | null;
  mediaCount: number | null;
  // 直近投稿の like+comment 平均（公開エンゲージメント）
  recentMediaCount: number;
  avgLikes: number | null;
  avgComments: number | null;
  error: string | null;
};

export async function businessDiscovery(username: string): Promise<CompetitorData> {
  type Raw = {
    business_discovery?: {
      followers_count?: number;
      media_count?: number;
      media?: { data?: Array<{ like_count?: number; comments_count?: number }> };
    };
  };
  const r = await graphGetSafe<Raw>(accountId(), {
    fields: `business_discovery.username(${username}){followers_count,media_count,media.limit(25){like_count,comments_count}}`,
  });
  if (r.error || !r.data?.business_discovery) {
    return {
      username,
      followersCount: null,
      mediaCount: null,
      recentMediaCount: 0,
      avgLikes: null,
      avgComments: null,
      error: r.error ?? "アカウントが見つからない/非公開の可能性",
    };
  }
  const bd = r.data.business_discovery;
  const media = bd.media?.data ?? [];
  const n = media.length;
  const sumLikes = media.reduce((s, m) => s + (m.like_count ?? 0), 0);
  const sumComments = media.reduce((s, m) => s + (m.comments_count ?? 0), 0);
  return {
    username,
    followersCount: bd.followers_count ?? null,
    mediaCount: bd.media_count ?? null,
    recentMediaCount: n,
    avgLikes: n > 0 ? sumLikes / n : null,
    avgComments: n > 0 ? sumComments / n : null,
    error: null,
  };
}
