export function KPICard({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number | null; // 前期間比(%)。undefined=非表示, null=比較対象なし
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-black/40">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-black/45">{sub}</p>}
      {delta !== undefined && (
        <p className="mt-1 text-xs">
          {delta === null ? (
            <span className="text-black/35">前期間比 —</span>
          ) : (
            <span className={delta >= 0 ? "text-emerald-600" : "text-red-600"}>
              前期間比 {delta >= 0 ? "▲" : "▼"}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </p>
      )}
    </div>
  );
}
