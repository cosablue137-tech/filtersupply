// 注文データから KPI・日次推移・商品別・顧客の集計を計算する。

import { fetchOrders, DATA_CUTOFF_ISO, type Order } from "./shopify";

export type Period = 7 | 30 | 60;

export type DailyPoint = {
  date: string; // YYYY-MM-DD
  sales: number;
  orders: number;
};

export type ProductRow = {
  name: string; // 「商品名 / バリアント」
  quantity: number;
  sales: number;
};

export type Metrics = {
  period: Period;
  generatedAt: string;
  kpi: {
    totalSales: number;
    orderCount: number;
    aov: number; // 平均注文額
    newCustomers: number;
  };
  daily: DailyPoint[];
  products: ProductRow[];
  customers: {
    newCount: number;
    returningCount: number;
    repeatRate: number; // リピート率（%）
  };
  // 直前の同じ長さの期間との比較
  comparison: {
    prevSales: number;
    prevOrders: number;
    salesDelta: number | null; // %（前期間が0ならnull）
    ordersDelta: number | null;
  };
};

function dateKey(iso: string): string {
  // ISO日時を JST の YYYY-MM-DD に変換
  const d = new Date(iso);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

function emptyDailyRange(period: Period): Map<string, DailyPoint> {
  const map = new Map<string, DailyPoint>();
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  // カットオフ（JST日付）より前の日は表示しない
  const cutoffKey = new Date(new Date(DATA_CUTOFF_ISO).getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (key < cutoffKey) continue;
    map.set(key, { date: key, sales: 0, orders: 0 });
  }
  return map;
}

export function aggregate(orders: Order[], period: Period): Metrics {
  // KPI
  const totalSales = orders.reduce((s, o) => s + o.netSales, 0);
  const orderCount = orders.length;
  const aov = orderCount > 0 ? totalSales / orderCount : 0;

  // 日次推移（期間の全日を0埋め）
  const daily = emptyDailyRange(period);
  for (const o of orders) {
    const key = dateKey(o.createdAt);
    const point = daily.get(key);
    if (point) {
      point.sales += o.netSales;
      point.orders += 1;
    }
  }

  // 商品別（バリアント単位で集計）
  const productMap = new Map<string, ProductRow>();
  for (const o of orders) {
    for (const li of o.lineItems) {
      const name = li.variantTitle ? `${li.title} / ${li.variantTitle}` : li.title;
      const row = productMap.get(name) ?? { name, quantity: 0, sales: 0 };
      row.quantity += li.quantity;
      row.sales += li.discountedTotal;
      productMap.set(name, row);
    }
  }
  const products = Array.from(productMap.values()).sort((a, b) => b.sales - a.sales);

  // 顧客（新規＝この期間の注文時点で累計1件目）
  const newCount = orders.filter((o) => o.isFirstOrderForCustomer).length;
  const returningCount = orderCount - newCount;
  const repeatRate = orderCount > 0 ? (returningCount / orderCount) * 100 : 0;

  return {
    period,
    generatedAt: new Date().toISOString(),
    kpi: {
      totalSales,
      orderCount,
      aov,
      newCustomers: newCount,
    },
    daily: Array.from(daily.values()),
    products,
    customers: { newCount, returningCount, repeatRate },
    comparison: { prevSales: 0, prevOrders: 0, salesDelta: null, ordersDelta: null },
  };
}

export async function getMetrics(period: Period): Promise<Metrics> {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const curStart = now - period * dayMs;
  const prevStart = new Date(now - 2 * period * dayMs).toISOString().slice(0, 10);

  // 現在＋前期間をまとめて取得（カットオフは fetchOrders 側で適用）
  const all = await fetchOrders(prevStart);
  const current = all.filter((o) => new Date(o.createdAt).getTime() >= curStart);
  const previous = all.filter((o) => new Date(o.createdAt).getTime() < curStart);

  const m = aggregate(current, period);
  const prevSales = previous.reduce((s, o) => s + o.netSales, 0);
  const prevOrders = previous.length;
  m.comparison = {
    prevSales,
    prevOrders,
    salesDelta: prevSales > 0 ? ((m.kpi.totalSales - prevSales) / prevSales) * 100 : null,
    ordersDelta: prevOrders > 0 ? ((m.kpi.orderCount - prevOrders) / prevOrders) * 100 : null,
  };
  return m;
}
