import { NextResponse } from "next/server";
import { fetchPackingOrders } from "@/lib/shopify";

export const dynamic = "force-dynamic";

// 注文一覧（カットオフ以降）。検索・絞り込みはクライアント側で行う。
export async function GET() {
  try {
    const orders = await fetchPackingOrders();
    // 新しい順
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
