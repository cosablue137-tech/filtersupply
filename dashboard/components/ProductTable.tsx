import type { ProductRow } from "@/lib/metrics";
import { yen, num } from "@/lib/format";

export function ProductTable({ rows }: { rows: ProductRow[] }) {
  const top = rows.slice(0, 15);
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">商品別ランキング</h2>
      {top.length === 0 ? (
        <p className="text-sm text-black/45">この期間の販売はありません。</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs text-black/40">
              <th className="pb-2 font-medium">商品</th>
              <th className="pb-2 text-right font-medium">数量</th>
              <th className="pb-2 text-right font-medium">売上</th>
            </tr>
          </thead>
          <tbody>
            {top.map((r) => (
              <tr key={r.name} className="border-b border-black/5 last:border-0">
                <td className="py-2 pr-2 text-ink">{r.name}</td>
                <td className="py-2 text-right tabular-nums text-black/70">{num(r.quantity)}</td>
                <td className="py-2 text-right tabular-nums font-medium text-ink">{yen(r.sales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
