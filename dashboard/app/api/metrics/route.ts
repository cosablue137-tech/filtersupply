import { NextResponse } from "next/server";
import { getMetrics, type Period } from "@/lib/metrics";

export const dynamic = "force-dynamic";

function parsePeriod(value: string | null): Period {
  const n = Number(value);
  if (n === 7 || n === 30 || n === 60) return n;
  return 30;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = parsePeriod(searchParams.get("period"));
  try {
    const metrics = await getMetrics(period);
    return NextResponse.json(metrics);
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
