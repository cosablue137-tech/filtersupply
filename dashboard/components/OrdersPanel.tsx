"use client";

import { useMemo, useState } from "react";
import type { PackingOrder } from "@/lib/shopify";
import { yen, num, dateTimeJST } from "@/lib/format";

type Filter = "all" | "unfulfilled" | "fulfilled";

export function OrdersPanel({ orders }: { orders: PackingOrder[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === "unfulfilled" && o.fulfilled) return false;
      if (filter === "fulfilled" && !o.fulfilled) return false;
      if (!kw) return true;
      const hay = [
        o.name,
        o.customerName,
        ...o.lineItems.map((li) => `${li.title} ${li.variantTitle ?? ""}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(kw);
    });
  }, [orders, q, filter]);

  const total = filtered.reduce((s, o) => s + o.total, 0);

  const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "unfulfilled", label: "未発送" },
    { value: "fulfilled", label: "発送済み" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="注文番号・顧客名・商品で検索"
          className="w-full max-w-xs rounded-lg border border-black/15 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <div className="inline-flex rounded-lg border border-black/10 bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                filter === f.value ? "bg-ink text-white" : "text-black/60 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-black/50">
          {num(filtered.length)} 件 ・ 合計 {yen(total)}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs text-black/40">
              <th className="p-3 font-medium">注文</th>
              <th className="p-3 font-medium">日時</th>
              <th className="p-3 font-medium">顧客</th>
              <th className="p-3 font-medium">商品</th>
              <th className="p-3 text-right font-medium">金額</th>
              <th className="p-3 font-medium">状態</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-black/45">
                  該当する注文がありません。
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-b border-black/5 last:border-0 align-top">
                  <td className="whitespace-nowrap p-3 font-medium text-ink">{o.name}</td>
                  <td className="whitespace-nowrap p-3 text-black/60">{dateTimeJST(o.createdAt)}</td>
                  <td className="whitespace-nowrap p-3 text-ink">{o.customerName}</td>
                  <td className="p-3 text-black/70">
                    {o.lineItems.map((li, i) => (
                      <div key={i}>
                        {li.title}
                        {li.variantTitle ? `（${li.variantTitle}）` : ""} ×{li.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right font-medium tabular-nums text-ink">
                    {yen(o.total)}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        o.fulfilled ? "bg-black/10 text-black/50" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.fulfilled ? "発送済み" : "未発送"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
