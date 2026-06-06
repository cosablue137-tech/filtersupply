"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Metrics } from "@/lib/metrics";
import { num, pct } from "@/lib/format";

export function CustomerStats({ customers }: { customers: Metrics["customers"] }) {
  const data = [
    { name: "新規", value: customers.newCount },
    { name: "リピート", value: customers.returningCount },
  ];
  const colors = ["#c08a3e", "#1a1a1a"];
  const hasData = customers.newCount + customers.returningCount > 0;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">顧客（新規 / リピート）</h2>
      {!hasData ? (
        <p className="text-sm text-black/45">この期間の注文はありません。</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${num(v)} 件`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colors[0] }} />
              新規 <span className="font-medium text-ink">{num(customers.newCount)} 件</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colors[1] }} />
              リピート <span className="font-medium text-ink">{num(customers.returningCount)} 件</span>
            </li>
            <li className="pt-2 text-black/60">
              リピート率 <span className="font-bold text-ink">{pct(customers.repeatRate)}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
