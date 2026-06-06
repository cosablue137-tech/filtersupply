// Instagram の生データ → ダッシュボード表示用の型付き集計に変換する。
// lib/metrics.ts（Shopify 側）と同じ役割。

import {
  fetchAccount,
  fetchAccountInsights,
  fetchFollowerDemographics,
  fetchMedia,
  businessDiscovery,
  competitorUsernames,
  type Demographics,
  type CompetitorData,
  type MediaItem,
} from "./instagram";

export type IgPeriod = 7 | 30 | 60;

export type FollowerPoint = {
  date: string; // YYYY-MM-DD
  newFollowers: number; // その日の純増
  reach: number;
};

export type PostRow = {
  id: string;
  permalink: string;
  caption: string; // 先頭を切り出した短縮
  format: string; // 画像 / カルーセル / リール / 動画
  date: string; // YYYY-MM-DD
  dow: string; // 曜日（日本語1文字）
  hour: number; // JST 時
  likes: number;
  comments: number;
  saved: number | null;
  reach: number | null;
  interactions: number;
  engagementRate: number; // %（reach基準、無ければフォロワー基準）
};

export type BreakdownRow = { label: string; posts: number; avgEngagementRate: number; avgReach: number | null };

export type Benchmark = {
  self: { username: string; followers: number; avgLikes: number; avgComments: number };
  competitors: Array<{
    username: string;
    followers: number | null;
    avgLikes: number | null;
    avgComments: number | null;
    error: string | null;
  }>;
};

export type IgMetrics = {
  period: IgPeriod;
  generatedAt: string;
  account: { username: string; followersCount: number; mediaCount: number; profilePictureUrl: string | null };
  kpi: {
    followersCount: number;
    newFollowers: number | null; // 期間純増（直近30日まで）
    periodReach: number;
    profileViews: number | null;
    websiteClicks: number | null;
  };
  followerSeries: FollowerPoint[];
  demographics: Demographics;
  posts: PostRow[];
  byFormat: BreakdownRow[];
  byHour: BreakdownRow[];
  byDow: BreakdownRow[];
  benchmark: Benchmark;
  warnings: string[];
};

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

function formatLabel(m: MediaItem): string {
  if (m.productType === "REELS") return "リール";
  if (m.mediaType === "CAROUSEL_ALBUM") return "カルーセル";
  if (m.mediaType === "VIDEO") return "動画";
  return "画像";
}

// JST の Date 部品を返す。
function jstParts(iso: string): { date: string; dow: string; hour: number } {
  const d = new Date(iso);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return {
    date: jst.toISOString().slice(0, 10),
    dow: DOW[jst.getUTCDay()],
    hour: jst.getUTCHours(),
  };
}

function shortCaption(c: string): string {
  const oneLine = c.replace(/\s+/g, " ").trim();
  return oneLine.length > 40 ? oneLine.slice(0, 40) + "…" : oneLine;
}

// 平均集計のための小ヘルパー: key ごとに件数・エンゲージ率合計・reach合計。
function groupBy(posts: PostRow[], keyOf: (p: PostRow) => string): BreakdownRow[] {
  const map = new Map<string, { posts: number; erSum: number; reachSum: number; reachN: number }>();
  for (const p of posts) {
    const k = keyOf(p);
    const g = map.get(k) ?? { posts: 0, erSum: 0, reachSum: 0, reachN: 0 };
    g.posts += 1;
    g.erSum += p.engagementRate;
    if (p.reach != null) {
      g.reachSum += p.reach;
      g.reachN += 1;
    }
    map.set(k, g);
  }
  return Array.from(map.entries()).map(([label, g]) => ({
    label,
    posts: g.posts,
    avgEngagementRate: g.posts > 0 ? g.erSum / g.posts : 0,
    avgReach: g.reachN > 0 ? g.reachSum / g.reachN : null,
  }));
}

export async function getIgMetrics(period: IgPeriod): Promise<IgMetrics> {
  const untilUnix = Math.floor(Date.now() / 1000);
  const sinceUnix = untilUnix - period * 24 * 60 * 60;
  const warnings: string[] = [];

  // 並列取得（互いに独立）
  const [account, insights, demographics, media] = await Promise.all([
    fetchAccount(),
    fetchAccountInsights(sinceUnix, untilUnix),
    fetchFollowerDemographics().catch((): Demographics => ({
      age: {}, gender: {}, city: {}, country: {}, available: false, note: "人口統計の取得に失敗",
    })),
    fetchMedia(50),
  ]);
  warnings.push(...insights.warnings);

  // フォロワー推移（reach と純増を日付でマージ）
  const reachByDate = new Map(insights.reachDaily.map((d) => [d.date, d.value]));
  const dates = new Set<string>([
    ...insights.reachDaily.map((d) => d.date),
    ...insights.followerCountDaily.map((d) => d.date),
  ]);
  const newByDate = new Map(insights.followerCountDaily.map((d) => [d.date, d.value]));
  const followerSeries: FollowerPoint[] = Array.from(dates)
    .sort()
    .map((date) => ({ date, reach: reachByDate.get(date) ?? 0, newFollowers: newByDate.get(date) ?? 0 }));
  const newFollowers = insights.followerCountDaily.length
    ? insights.followerCountDaily.reduce((s, d) => s + d.value, 0)
    : null;
  const periodReach = insights.reachDaily.reduce((s, d) => s + d.value, 0);

  // 投稿を期間でフィルタ → 行に変換
  const sinceMs = sinceUnix * 1000;
  const posts: PostRow[] = media
    .filter((m) => new Date(m.timestamp).getTime() >= sinceMs)
    .map((m) => {
      const parts = jstParts(m.timestamp);
      const interactions =
        m.totalInteractions ?? m.likeCount + m.commentsCount + (m.saved ?? 0) + (m.shares ?? 0);
      // エンゲージ率: reach 基準が理想。無ければフォロワー基準。
      const denom = m.reach && m.reach > 0 ? m.reach : account.followersCount || 1;
      return {
        id: m.id,
        permalink: m.permalink,
        caption: shortCaption(m.caption),
        format: formatLabel(m),
        date: parts.date,
        dow: parts.dow,
        hour: parts.hour,
        likes: m.likeCount,
        comments: m.commentsCount,
        saved: m.saved,
        reach: m.reach,
        interactions,
        engagementRate: (interactions / denom) * 100,
      };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate);

  // 形式別・時間帯別・曜日別
  const byFormat = groupBy(posts, (p) => p.format).sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
  const byHour = groupBy(posts, (p) => `${p.hour}時`).sort(
    (a, b) => parseInt(a.label) - parseInt(b.label)
  );
  const byDow = groupBy(posts, (p) => p.dow).sort((a, b) => DOW.indexOf(a.label) - DOW.indexOf(b.label));

  // 競合ベンチマーク
  const usernames = competitorUsernames();
  const competitorsRaw: CompetitorData[] = usernames.length
    ? await Promise.all(usernames.map((u) => businessDiscovery(u)))
    : [];
  const selfRecent = media.slice(0, 25);
  const selfAvgLikes = selfRecent.length
    ? selfRecent.reduce((s, m) => s + m.likeCount, 0) / selfRecent.length
    : 0;
  const selfAvgComments = selfRecent.length
    ? selfRecent.reduce((s, m) => s + m.commentsCount, 0) / selfRecent.length
    : 0;
  const benchmark: Benchmark = {
    self: {
      username: account.username,
      followers: account.followersCount,
      avgLikes: selfAvgLikes,
      avgComments: selfAvgComments,
    },
    competitors: competitorsRaw.map((c) => ({
      username: c.username,
      followers: c.followersCount,
      avgLikes: c.avgLikes,
      avgComments: c.avgComments,
      error: c.error,
    })),
  };

  return {
    period,
    generatedAt: new Date().toISOString(),
    account: {
      username: account.username,
      followersCount: account.followersCount,
      mediaCount: account.mediaCount,
      profilePictureUrl: account.profilePictureUrl,
    },
    kpi: {
      followersCount: account.followersCount,
      newFollowers,
      periodReach,
      profileViews: insights.profileViews,
      websiteClicks: insights.websiteClicks,
    },
    followerSeries,
    demographics,
    posts,
    byFormat,
    byHour,
    byDow,
    benchmark,
    warnings,
  };
}
