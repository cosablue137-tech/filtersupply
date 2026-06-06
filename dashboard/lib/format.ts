export function yen(n: number): string {
  return "¥" + Math.round(n).toLocaleString("ja-JP");
}

export function num(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

export function pct(n: number): string {
  return n.toFixed(1) + "%";
}

// YYYY-MM-DD -> M/D
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}
