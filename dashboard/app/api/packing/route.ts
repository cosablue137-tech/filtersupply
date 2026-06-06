import { NextResponse } from "next/server";
import { getPackingData } from "@/lib/packing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPackingData();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
