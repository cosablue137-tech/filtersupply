"use client";

import { useCallback, useEffect, useState } from "react";
import type { Metrics, Period } from "@/lib/metrics";
import type { IgMetrics } from "@/lib/ig-metrics";
import type { IgAttribution } from "@/lib/shopify";
import { KPICard } from "@/components/KPICard";
import { SalesChart } from "@/components/SalesChart";
import { ProductTable } from "@/components/ProductTable";
import { CustomerStats } from "@/components/CustomerStats";
import { PeriodSelector } from "@/components/PeriodSelector";
import { InstagramPanel } from "@/components/InstagramPanel";
import { PackingPanel } from "@/components/PackingPanel";
import type { PackingData } from "@/lib/packing";
import { yen, num } from "@/lib/format";
import { downloadCSV } from "@/lib/csv";

const REFRESH_MS = 60_000;
type Tab = "sales" | "packing" | "instagram";
const TAB_LABELS: Record<Tab, string> = { sales: "売上", packing: "梱包", instagram: "Instagram" };
type IgPayload = IgMetrics & { attribution: IgAttribution | null; cached?: boolean };

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("sales");
  const [period, setPeriod] = useState<Period>(30);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [ig, setIg] = useState<IgPayload | null>(null);
  const [packing, setPacking] = useState<PackingData | null>(null);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async (p: Period) => {
    try {
      const res = await fetch(`/api/metrics?period=${p}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
      setMetrics(data);
      setUpdatedAt(new Date());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIg = useCallback(async (p: Period) => {
    try {
      const res = await fetch(`/api/instagram?period=${p}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
      setIg(data);
      setUpdatedAt(new Date());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPacking = useCallback(async () => {
    try {
      const res = await fetch(`/api/packing`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "取得に失敗しました");
      setPacking(data);
      setUpdatedAt(new Date());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // タブ・期間が変わるたびに該当データを取得
  useEffect(() => {
    setLoading(true);
    setError("");
    if (tab === "sales") loadSales(period);
    else if (tab === "packing") loadPacking();
    else loadIg(period);
  }, [tab, period, loadSales, loadIg, loadPacking]);

  // 売上・梱包タブは 60 秒自動更新（IG はレート制限のためサーバ側1hキャッシュ）
  useEffect(() => {
    if (tab === "sales") {
      const id = setInterval(() => loadSales(period), REFRESH_MS);
      return () => clearInterval(id);
    }
    if (tab === "packing") {
      const id = setInterval(() => loadPacking(), REFRESH_MS);
      return () => clearInterval(id);
    }
  }, [tab, period, loadSales, loadPacking]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">Filter Supply ダッシュボード</h1>
          <p className="mt-1 text-xs text-black/45">
            {updatedAt
              ? tab === "instagram"
                ? `最終更新 ${updatedAt.toLocaleTimeString("ja-JP")}${ig?.cached ? "（1時間キャッシュ）" : ""}`
                : `最終更新 ${updatedAt.toLocaleTimeString("ja-JP")}（60秒ごとに自動更新）`
              : "読み込み中…"}
          </p>
        </div>
        {tab !== "packing" && <PeriodSelector value={period} onChange={setPeriod} />}
      </header>

      {/* タブ */}
      <div className="mb-6 inline-flex rounded-lg border border-black/10 bg-white p-1">
        {(["sales", "packing", "instagram"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-ink text-white" : "text-black/60 hover:text-ink"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 売上タブ */}
      {tab === "sales" && (
        <>
          {!metrics && loading && !error && (
            <p className="text-sm text-black/45">データを取得しています…</p>
          )}
          {metrics && (
            <div className={loading ? "opacity-60 transition" : "transition"}>
              <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KPICard label="総売上" value={yen(metrics.kpi.totalSales)} sub={`直近${metrics.period}日`} />
                <KPICard label="注文数" value={`${num(metrics.kpi.orderCount)} 件`} />
                <KPICard label="平均注文額" value={yen(metrics.kpi.aov)} />
                <KPICard label="新規顧客" value={`${num(metrics.kpi.newCustomers)} 件`} />
              </section>

              <section className="mb-6">
                <SalesChart data={metrics.daily} />
              </section>

              <div className="mb-3 flex justify-end">
                <button
                  onClick={() =>
                    downloadCSV("sales-products.csv", [
                      ["商品", "数量", "売上"],
                      ...metrics.products.map((p) => [p.name, p.quantity, Math.round(p.sales)]),
                    ])
                  }
                  className="rounded-lg border border-black/15 px-3 py-1 text-xs font-medium text-ink hover:bg-black/5"
                >
                  商品別をCSVで保存
                </button>
              </div>
              <section className="grid gap-6 lg:grid-cols-2">
                <ProductTable rows={metrics.products} />
                <CustomerStats customers={metrics.customers} />
              </section>
            </div>
          )}
        </>
      )}

      {/* 梱包タブ */}
      {tab === "packing" && (
        <>
          {!packing && loading && !error && (
            <p className="text-sm text-black/45">梱包データを取得しています…</p>
          )}
          {packing && (
            <div className={loading ? "opacity-60 transition" : "transition"}>
              <PackingPanel data={packing} />
            </div>
          )}
        </>
      )}

      {/* Instagram タブ */}
      {tab === "instagram" && (
        <>
          {!ig && loading && !error && (
            <p className="text-sm text-black/45">
              Instagram のデータを取得しています…（初回は数十秒かかることがあります）
            </p>
          )}
          {ig && (
            <div className={loading ? "opacity-60 transition" : "transition"}>
              <InstagramPanel data={ig} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
