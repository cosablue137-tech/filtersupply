"use client";

import { useEffect, useMemo, useState } from "react";
import type { PackingData } from "@/lib/packing";
import { beanName, gramsOf } from "@/lib/bean";
import { num, grams, dateTimeJST } from "@/lib/format";
import { downloadCSV } from "@/lib/csv";

export function PackingPanel({ data }: { data: PackingData }) {
  // 「準備済み」チェック（チーム共有・Redis保存）
  const [prepared, setPreparedState] = useState<Set<string>>(new Set());
  const [prepConfigured, setPrepConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/prepared", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.ids)) setPreparedState(new Set(d.ids));
        setPrepConfigured(d.configured !== false);
      })
      .catch(() => setPrepConfigured(false));
  }, []);

  const togglePrepared = async (id: string) => {
    const next = !prepared.has(id);
    // 楽観的更新
    setPreparedState((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });
    try {
      await fetch("/api/prepared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, prepared: next }),
      });
    } catch {
      // 失敗したら元に戻す
      setPreparedState((prev) => {
        const s = new Set(prev);
        if (next) s.delete(id);
        else s.add(id);
        return s;
      });
    }
  };

  // 明細キー（注文ID#明細index）
  const itemKey = (orderId: string, i: number) => `${orderId}#${i}`;
  const orderFullyPrepared = (o: { id: string; lineItems: unknown[] }) =>
    o.lineItems.length > 0 && o.lineItems.every((_, i) => prepared.has(itemKey(o.id, i)));

  const toPack = data.orders.filter((o) => !o.fulfilled);
  const preparedToPack = toPack.filter(orderFullyPrepared).length;

  // チェック済み明細から「完了量」をライブ集計（焙煎リスト・仕入りリスト用）
  const { completedPick, completedRoast } = useMemo(() => {
    const pick = new Map<string, number>(); // `${title} ${variant}` -> 完了個数
    const roast = new Map<string, { grams: number; units: number }>(); // 豆 -> 完了量
    for (const o of data.orders) {
      if (o.fulfilled) continue;
      o.lineItems.forEach((li, i) => {
        if (!prepared.has(itemKey(o.id, i))) return;
        const variantTitle = li.variantTitle ?? "—";
        const pk = `${li.title} ${variantTitle}`;
        pick.set(pk, (pick.get(pk) ?? 0) + li.quantity);
        const bean = beanName(li.title);
        const r = roast.get(bean) ?? { grams: 0, units: 0 };
        r.grams += gramsOf(li.variantTitle) * li.quantity;
        r.units += li.quantity;
        roast.set(bean, r);
      });
    }
    return { completedPick: pick, completedRoast: roast };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.orders, prepared]);

  const exportPicking = () => {
    const rows: (string | number)[][] = [
      ["商品", "オプション(挽き目/重量)", "準備数"],
      ...data.pickingList.map((p) => [p.title, p.variantTitle, p.quantity]),
    ];
    downloadCSV("picking-list.csv", rows);
  };

  const exportRoast = () => {
    const rows: (string | number)[][] = [
      ["豆", "合計重量(g)", "個数"],
      ...data.roastList.map((r) => [r.bean, r.grams, r.units]),
    ];
    downloadCSV("roast-list.csv", rows);
  };

  const exportLabels = () => {
    const targets = data.orders.filter((o) => !o.fulfilled);
    const rows: (string | number)[][] = [
      ["注文番号", "氏名", "郵便番号", "都道府県", "市区町村", "住所1", "住所2", "電話"],
      ...targets.map((o) => [
        o.name,
        o.address.name,
        o.address.zip,
        o.address.province,
        o.address.city,
        o.address.address1,
        o.address.address2,
        o.address.phone,
      ]),
    ];
    downloadCSV("shipping-labels.csv", rows);
  };

  const totalGrams = data.roastList.reduce((s, r) => s + r.grams, 0);

  // 注文からの経過日数（JST基準のざっくり日数）
  const daysSince = (iso: string) =>
    Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 text-sm text-black/60">
        <div>
          <span className="font-medium text-ink">{data.cutoffLabel}</span> が対象。
          未発送 <span className="font-bold text-ink">{num(data.toPackCount)}</span> 件 / 発送済み{" "}
          {num(data.fulfilledCount)} 件
          <span className="ml-2 text-emerald-700">
            準備済み <span className="font-bold">{num(preparedToPack)}</span>/{num(data.toPackCount)}
          </span>
          {!prepConfigured && (
            <span className="ml-2 text-amber-700">（準備チェックの保存先が未設定）</span>
          )}
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <a
            href="/api/clickpost-csv"
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              data.toPackCount === 0
                ? "pointer-events-none border border-black/15 text-black/30"
                : "bg-ink text-white hover:opacity-90"
            }`}
          >
            クリックポストCSV
          </a>
          <button
            onClick={exportLabels}
            disabled={data.toPackCount === 0}
            className="rounded-lg border border-black/15 px-3 py-1 text-xs font-medium text-ink hover:bg-black/5 disabled:opacity-40"
          >
            発送ラベルCSV（汎用）
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-black/15 px-3 py-1 text-xs font-medium text-ink hover:bg-black/5"
          >
            印刷
          </button>
        </div>
      </div>
      {data.toPackCount > 40 && (
        <p className="no-print -mt-3 text-xs text-amber-700">
          ※ クリックポストの一括アップロードは1回40件まで。未発送が {data.toPackCount} 件あるので、CSVを分割してアップロードしてください。
        </p>
      )}

      {/* 焙煎リスト（豆ごとの合計重量） */}
      <div className="rounded-2xl border border-ink/20 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">
            焙煎リスト（豆ごとの合計）<span className="ml-2 text-xs font-normal text-black/45">合計 {grams(totalGrams)}</span>
          </h2>
          <button
            onClick={exportRoast}
            disabled={data.roastList.length === 0}
            className="rounded-lg border border-black/15 px-3 py-1 text-xs font-medium text-ink hover:bg-black/5 disabled:opacity-40"
          >
            CSVで保存
          </button>
        </div>
        {data.roastList.length === 0 ? (
          <p className="text-sm text-black/45">未発送の注文はありません。</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs text-black/40">
                <th className="pb-2 font-medium">豆（焙煎度）</th>
                <th className="pb-2 text-right font-medium">個数</th>
                <th className="pb-2 text-right font-medium">合計重量</th>
                <th className="pb-2 text-right font-medium">完了</th>
              </tr>
            </thead>
            <tbody>
              {data.roastList.map((r, i) => {
                const done = completedRoast.get(r.bean)?.grams ?? 0;
                const full = done >= r.grams && r.grams > 0;
                return (
                  <tr key={i} className="border-b border-black/5 last:border-0">
                    <td className="py-2 pr-2 font-medium text-ink">{r.bean}</td>
                    <td className="py-2 text-right tabular-nums text-black/60">{r.units}</td>
                    <td className="py-2 text-right text-lg font-bold tabular-nums text-ink">{grams(r.grams)}</td>
                    <td className={`py-2 text-right tabular-nums font-medium ${full ? "text-emerald-700" : "text-black/45"}`}>
                      {full ? "✓ " : ""}
                      {grams(done)}/{grams(r.grams)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-black/40">
          ※ 販売(焙煎後)重量の合計です。生豆量は焙煎ロス分を加味して見積もってください。
        </p>
      </div>

      {/* 挽き目サマリー */}
      {data.grindSummary.length > 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-ink">挽き目サマリー（未発送）</h2>
          <div className="flex flex-wrap gap-2">
            {data.grindSummary.map((g, i) => (
              <span key={i} className="rounded-full border border-black/10 bg-black/[0.02] px-3 py-1 text-sm">
                {g.label} <span className="ml-1 font-bold text-ink">{g.units}</span>
              </span>
            ))}
          </div>
        </div>
      )}

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
                <th className="pb-2 text-right font-medium">完了</th>
              </tr>
            </thead>
            <tbody>
              {data.pickingList.map((p, i) => {
                const done = completedPick.get(`${p.title} ${p.variantTitle}`) ?? 0;
                const full = done >= p.quantity && p.quantity > 0;
                return (
                  <tr key={i} className="border-b border-black/5 last:border-0">
                    <td className="py-2 pr-2 text-ink">{p.title}</td>
                    <td className="py-2 pr-2 text-black/70">{p.variantTitle}</td>
                    <td className="py-2 text-right text-lg font-bold tabular-nums text-ink">{p.quantity}</td>
                    <td className={`py-2 text-right tabular-nums font-medium ${full ? "text-emerald-700" : "text-black/45"}`}>
                      {full ? "✓ " : ""}
                      {done}/{p.quantity}
                    </td>
                  </tr>
                );
              })}
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
            {data.orders.map((o) => {
              const doneCount = o.lineItems.filter((_, i) => prepared.has(itemKey(o.id, i))).length;
              const allDone = !o.fulfilled && orderFullyPrepared(o);
              return (
              <div
                key={o.id}
                className={`rounded-xl border p-4 ${
                  o.fulfilled
                    ? "border-black/10 bg-black/[0.02] opacity-60"
                    : allDone
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-ink/20 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-ink">{o.name}</span>
                  {(() => {
                    if (o.fulfilled)
                      return (
                        <span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-medium text-black/50">
                          発送済み
                        </span>
                      );
                    const d = daysSince(o.createdAt);
                    const urgent = d >= 3;
                    return (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          urgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        未発送{d > 0 ? `・${d}日経過` : "・本日"}
                      </span>
                    );
                  })()}
                </div>
                <p className="mb-2 flex items-center justify-between text-xs text-black/45">
                  <span>{o.customerName} ・ {dateTimeJST(o.createdAt)}</span>
                  {!o.fulfilled && (
                    <span className={allDone ? "font-bold text-emerald-700" : "text-black/45"}>
                      {allDone ? "✓ 準備済み" : `準備 ${doneCount}/${o.lineItems.length}`}
                    </span>
                  )}
                </p>
                <ul className="space-y-1 text-sm">
                  {o.lineItems.map((li, i) => {
                    const key = itemKey(o.id, i);
                    const checked = prepared.has(key);
                    // 発送済みは表示のみ、未発送は豆ごとにチェック可能
                    if (o.fulfilled) {
                      return (
                        <li key={i} className="flex items-start justify-between gap-2">
                          <span className="text-ink">
                            {li.title}
                            {li.variantTitle && (
                              <span className="block text-xs text-black/55">{li.variantTitle}</span>
                            )}
                          </span>
                          <span className="shrink-0 font-bold tabular-nums text-ink">×{li.quantity}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={i}>
                        <label
                          className={`flex cursor-pointer items-start justify-between gap-2 rounded-md px-2 py-1 ${
                            checked ? "bg-emerald-100/70" : "hover:bg-black/5"
                          }`}
                        >
                          <span className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePrepared(key)}
                              disabled={!prepConfigured}
                              className="no-print mt-0.5 h-4 w-4 accent-emerald-600"
                            />
                            <span className={checked ? "text-emerald-800 line-through decoration-emerald-600/50" : "text-ink"}>
                              {checked && <span className="print:inline">✓ </span>}
                              {li.title}
                              {li.variantTitle && (
                                <span className="block text-xs text-black/55">{li.variantTitle}</span>
                              )}
                            </span>
                          </span>
                          <span className="shrink-0 font-bold tabular-nums text-ink">×{li.quantity}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
