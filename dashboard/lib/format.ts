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

// ISO日時 -> JST の "M/D HH:mm"
export function dateTimeJST(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
