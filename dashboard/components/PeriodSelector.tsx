"use client";

import type { Period } from "@/lib/metrics";

const OPTIONS: { value: Period; label: string }[] = [
  { value: 7, label: "7日" },
  { value: 30, label: "30日" },
  { value: 60, label: "60日" },
];

export function PeriodSelector({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-black/10 bg-white p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition ${
            value === o.value ? "bg-ink text-white" : "text-black/60 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
