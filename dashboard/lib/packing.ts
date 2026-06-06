// 梱包・焙煎用データ。未発送注文から各種の集計を作る。

import { fetchPackingOrders, type PackingOrder } from "./shopify";
import { beanName, gramsOf, grindOf } from "./bean";

export type PickRow = {
  title: string; // 商品名（豆）
  variantTitle: string; // 挽き目・重量などのオプション
  quantity: number; // 準備すべき合計数
};

// 焙煎用：豆（瓶/リフィル・挽き目をまたいで合算）ごとの合計重量と個数
export type RoastRow = {
  bean: string; // 豆名＋焙煎度（パッケージ表記は除去）
  grams: number; // 合計重量(g)
  units: number; // 合計個数
};

export type GrindRow = {
  label: string; // 挽き目（豆のまま / 中挽き など）
  units: number;
};

export type PackingData = {
  generatedAt: string;
  cutoffLabel: string;
  toPackCount: number;
  fulfilledCount: number;
  roastList: RoastRow[]; // 焙煎リスト（豆ごとの合計g）
  grindSummary: GrindRow[]; // 挽き目ごとの個数
  pickingList: PickRow[]; // 仕入りリスト（豆×オプションの合計）
  orders: PackingOrder[]; // 注文ごとの梱包伝票
};

export async function getPackingData(): Promise<PackingData> {
  const all = await fetchPackingOrders();
  const toPack = all.filter((o) => !o.fulfilled);

  const pickMap = new Map<string, PickRow>();
  const roastMap = new Map<string, RoastRow>();
  const grindMap = new Map<string, GrindRow>();

  for (const o of toPack) {
    for (const li of o.lineItems) {
      const variantTitle = li.variantTitle ?? "—";

      // 仕入りリスト（豆×オプション）
      const pickKey = `${li.title} ${variantTitle}`;
      const pick = pickMap.get(pickKey) ?? { title: li.title, variantTitle, quantity: 0 };
      pick.quantity += li.quantity;
      pickMap.set(pickKey, pick);

      // 焙煎リスト（豆ごとに合算）
      const bean = beanName(li.title);
      const roast = roastMap.get(bean) ?? { bean, grams: 0, units: 0 };
      roast.grams += gramsOf(li.variantTitle) * li.quantity;
      roast.units += li.quantity;
      roastMap.set(bean, roast);

      // 挽き目サマリー
      const g = grindOf(li.variantTitle);
      const grind = grindMap.get(g) ?? { label: g, units: 0 };
      grind.units += li.quantity;
      grindMap.set(g, grind);
    }
  }

  const pickingList = Array.from(pickMap.values()).sort(
    (a, b) => a.title.localeCompare(b.title, "ja") || a.variantTitle.localeCompare(b.variantTitle, "ja")
  );
  const roastList = Array.from(roastMap.values()).sort((a, b) => b.grams - a.grams);
  const grindSummary = Array.from(grindMap.values()).sort((a, b) => b.units - a.units);

  const orders = [...all].sort((a, b) => {
    if (a.fulfilled !== b.fulfilled) return a.fulfilled ? 1 : -1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return {
    generatedAt: new Date().toISOString(),
    cutoffLabel: "2026-06-05 21:00 以降の注文",
    toPackCount: toPack.length,
    fulfilledCount: all.length - toPack.length,
    roastList,
    grindSummary,
    pickingList,
    orders,
  };
}
