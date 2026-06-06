// 豆名・重量・挽き目を商品/バリアント名から取り出す純粋関数（サーバ・クライアント共用）。

// パッケージ表記を除いた「豆名＋焙煎度」。
export function beanName(title: string): string {
  return title
    .replace(/(リフィルパック|リフィル|瓶|袋|パック)/g, " ")
    .replace(/[\s　]+/g, " ")
    .trim();
}

// バリアント表記から重量(g)。例: "200g(10%OFF) / Whole Bean" → 200
export function gramsOf(variantTitle: string | null): number {
  if (!variantTitle) return 0;
  const m = variantTitle.match(/(\d+)\s*g/i);
  return m ? Number(m[1]) : 0;
}

// バリアント表記から重量を除いた「挽き目」。
export function grindOf(variantTitle: string | null): string {
  if (!variantTitle) return "—";
  const s = variantTitle
    .replace(/\d+\s*g(\([^)]*\))?/i, "")
    .replace(/^[\s　/／]+|[\s　/／]+$/g, "")
    .trim();
  return s || "—";
}
