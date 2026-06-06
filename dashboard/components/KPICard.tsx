export function KPICard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-black/40">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-black/45">{sub}</p>}
    </div>
  );
}
