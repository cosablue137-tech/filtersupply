import { NextResponse } from "next/server";
import { getPrepared, setPrepared, isConfigured } from "@/lib/prepared";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ configured: isConfigured(), ids: await getPrepared() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const prepared = Boolean(body?.prepared);
    if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });
    await setPrepared(id, prepared);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
