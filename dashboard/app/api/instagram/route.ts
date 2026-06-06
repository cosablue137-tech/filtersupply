import { NextResponse } from "next/server";
import { getIgMetrics, type IgPeriod, type IgMetrics } from "@/lib/ig-metrics";
import { fetchIgAttribution, type IgAttribution } from "@/lib/shopify";

export const dynamic = "force-dynamic";

function parsePeriod(value: string | null): IgPeriod {
  const n = Number(value);
  if (n === 7 || n === 30 || n === 60) return n;
  return 30;
}

// Instagram API はレート制限が厳しいため、サーバー側で 1 時間キャッシュする。
const TTL_MS = 60 * 60 * 1000;
type Payload = IgMetrics & { attribution: IgAttribution | null };
const cache = new Map<IgPeriod, { at: number; data: Payload }>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = parsePeriod(searchParams.get("period"));
  const force = searchParams.get("force") === "1";

  const hit = cache.get(period);
  if (!force && hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ ...hit.data, cached: true, cachedAt: new Date(hit.at).toISOString() });
  }

  try {
    const ig = await getIgMetrics(period);
    // 売上寄与（Shopify 側・instagram 由来注文）。失敗しても IG 指標は返す。
    let attribution: IgAttribution | null = null;
    try {
      attribution = await fetchIgAttribution(period);
    } catch (e) {
      ig.warnings.push(`売上寄与の取得に失敗: ${e instanceof Error ? e.message : "不明"}`);
    }
    const data: Payload = { ...ig, attribution };
    cache.set(period, { at: Date.now(), data });
    return NextResponse.json({ ...data, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
