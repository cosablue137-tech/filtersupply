"use client";

import type { PackingData } from "@/lib/packing";
import { num, dateTimeJST } from "@/lib/format";
import { downloadCSV } from "@/lib/csv";

export function PackingPanel({ data }: { data: PackingData }) {
  const exportPicking = () => {
    const rows: (string | number)[][] = [
      ["商品", "オプション(挽き目/重量)", "準備数"],
      ...data.pickingList.map((p) => [p.title, p.variantTitle, p.quantity]),
    ];
    downloadCSV("picking-list.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-black/60">
        <span className="font-medium text-ink">{data.cutoffLabel}</span> が対象。
        未発送 <span className="font-bold text-ink">{num(data.toPackCount)}</span> 件 / 発送済み{" "}
        {num(data.fulfilledCount)} 件
      </div>

      {/* 仕入りリスト（合計数） */}
      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">仕入りリスト（未発送の合計）</h2>
          <button
            onClick={exportPicking}
            disabled={data.pickingList.length === 0}
            className="rounded-lg border border-black/15 px-3 py-1 text-xs font-medium text-ink hover:bg-black/5 disabled:opacity-40"
          >
            CSVで保存
          </button>
        </div>
        {data.pickingList.length === 0 ? (
          <p className="text-sm text-black/45">未発送の注文はありません。</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs text-black/40">
                <th className="pb-2 font-medium">商品（豆）</th>
                <th className="pb-2 font-medium">挽き目・重量</th>
                <th className="pb-2 text-right font-medium">準備数</th>
              </tr>
            </thead>
            <tbody>
              {data.pickingList.map((p, i) => (
                <tr key={i} className="border-b border-black/5 last:border-0">
                  <td className="py-2 pr-2 text-ink">{p.title}</td>
                  <td className="py-2 pr-2 text-black/70">{p.variantTitle}</td>
                  <td className="py-2 text-right text-lg font-bold tabular-nums text-ink">{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 注文ごとの梱包伝票 */}
      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-ink">注文ごとの梱包伝票</h2>
        {data.orders.length === 0 ? (
          <p className="text-sm text-black/45">対象の注文はありません。</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.orders.map((o) => (
              <div
                key={o.id}
                className={`rounded-xl border p-4 ${
                  o.fulfilled ? "border-black/10 bg-black/[0.02] opacity-60" : "border-ink/20 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-ink">{o.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      o.fulfilled ? "bg-black/10 text-black/50" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {o.fulfilled ? "発送済み" : "未発送"}
                  </span>
                </div>
                <p className="mb-2 text-xs text-black/45">
                  {o.customerName} ・ {dateTimeJST(o.createdAt)}
                </p>
                <ul className="space-y-1 text-sm">
                  {o.lineItems.map((li, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <span className="text-ink">
                        {li.title}
                        {li.variantTitle && (
                          <span className="block text-xs text-black/55">{li.variantTitle}</span>
                        )}
                      </span>
                      <span className="shrink-0 font-bold tabular-nums text-ink">×{li.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
