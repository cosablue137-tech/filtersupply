"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DailyPoint } from "@/lib/metrics";
import { yen, num, shortDate } from "@/lib/format";

export function SalesChart({ data }: { data: DailyPoint[] }) {
  const chartData = data.map((d) => ({ ...d, label: shortDate(d.date) }));
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">売上推移（日次）</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#00000010" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#00000066" }} interval="preserveStartEnd" />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#00000066" }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
              width={40}
            />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#00000066" }} width={28} />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === "売上" ? [yen(value), name] : [num(value) + " 件", name]
              }
              labelFormatter={(l) => `${l}`}
            />
            <Bar yAxisId="left" dataKey="sales" name="売上" fill="#1a1a1a" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Line yAxisId="right" type="monotone" dataKey="orders" name="注文数" stroke="#c08a3e" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
