import iconv from "iconv-lite";
import { getPackingData } from "@/lib/packing";
import { buildClickPostRows, rowsToCSV } from "@/lib/clickpost";

export const dynamic = "force-dynamic";

// 未発送注文からクリックポスト「まとめ申込」CSV（Shift-JIS）を生成して返す。
export async function GET() {
  try {
    const data = await getPackingData();
    const unfulfilled = data.orders.filter((o) => !o.fulfilled);
    const csv = rowsToCSV(buildClickPostRows(unfulfilled));
    const buf = iconv.encode(csv, "Shift_JIS");
    return new Response(buf, {
      headers: {
        "Content-Type": "text/csv; charset=Shift_JIS",
        "Content-Disposition": `attachment; filename="clickpost.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
