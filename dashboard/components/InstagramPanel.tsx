"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { KPICard } from "@/components/KPICard";
import { num, pct, shortDate, yen } from "@/lib/format";
import type { IgMetrics, BreakdownRow } from "@/lib/ig-metrics";
import type { IgAttribution } from "@/lib/shopify";

type Payload = IgMetrics & { attribution: IgAttribution | null };

export function InstagramPanel({ data }: { data: Payload }) {
  return (
    <div>
      {/* KPI */}
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="フォロワー" value={num(data.kpi.followersCount)} sub={`@${data.account.username}`} />
        <KPICard
          label="期間の純増"
          value={data.kpi.newFollowers == null ? "—" : `${data.kpi.newFollowers >= 0 ? "+" : ""}${num(data.kpi.newFollowers)}`}
          sub={`直近${data.period}日`}
        />
        <KPICard label="リーチ（期間）" value={num(data.kpi.periodReach)} />
        <KPICard
          label="サイトクリック"
          value={data.kpi.websiteClicks == null ? "—" : num(data.kpi.websiteClicks)}
          sub={data.kpi.profileViews == null ? undefined : `プロフ閲覧 ${num(data.kpi.profileViews)}`}
        />
      </section>

      {/* フォロワー推移 / リーチ */}
      <section className="mb-6">
        <FollowerChart series={data.followerSeries} />
      </section>

      {/* 売上寄与 */}
      {data.attribution && (
        <section className="mb-6">
          <AttributionCard a={data.attribution} websiteClicks={data.kpi.websiteClicks} />
        </section>
      )}

      {/* 形式別・曜日別・時間帯別 */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <BreakdownBars title="形式別 平均エンゲージ率" rows={data.byFormat} />
        <BreakdownBars title="曜日別 平均エンゲージ率" rows={data.byDow} />
      </section>
      <section className="mb-6">
        <BreakdownBars title="時間帯別 平均エンゲージ率" rows={data.byHour} wide />
      </section>

      {/* 投稿ランキング */}
      <section className="mb-6">
        <PostTable rows={data.posts} />
      </section>

      {/* 人口統計 */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <DemographicsCard title="年齢層" map={data.demographics.age} note={data.demographics.note} available={data.demographics.available} />
        <DemographicsCard title="性別" map={data.demographics.gender} note={null} available={data.demographics.available} />
        <DemographicsCard title="都市" map={data.demographics.city} note={null} available={data.demographics.available} />
        <DemographicsCard title="国" map={data.demographics.country} note={null} available={data.demographics.available} />
      </section>

      {/* 競合ベンチマーク */}
      <section className="mb-6">
        <BenchmarkCard benchmark={data.benchmark} />
      </section>

      {/* 取得上の注意 */}
      {data.warnings.length > 0 && (
        <section className="mb-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p className="mb-1 font-medium">取得に関する注意</p>
          <ul className="list-disc pl-4">
            {data.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}

function FollowerChart({ series }: { series: IgMetrics["followerSeries"] }) {
  const chartData = series.map((d) => ({ ...d, label: shortDate(d.date) }));
  return (
    <Card title="リーチ推移 / フォロワー純増（日次）">
      {chartData.length === 0 ? (
        <p className="text-sm text-black/45">この期間の時系列データがありません。</p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#00000010" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#00000066" }} interval="preserveStartEnd" />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#00000066" }}
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                width={40}
              />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#00000066" }} width={32} />
              <Tooltip
                formatter={(value: number, name: string) => [num(value), name]}
              />
              <Bar yAxisId="left" dataKey="reach" name="リーチ" fill="#1a1a1a" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="newFollowers" name="フォロワー純増" stroke="#c08a3e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function BreakdownBars({ title, rows, wide }: { title: string; rows: BreakdownRow[]; wide?: boolean }) {
  const data = rows.map((r) => ({ label: r.label, er: Number(r.avgEngagementRate.toFixed(2)), posts: r.posts }));
  return (
    <Card title={title}>
      {data.length === 0 ? (
        <p className="text-sm text-black/45">この期間の投稿がありません。</p>
      ) : (
        <div className={wide ? "h-64 w-full" : "h-56 w-full"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#00000010" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#00000066" }} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#00000066" }} tickFormatter={(v) => `${v}%`} width={40} />
              <Tooltip
                formatter={(value: number, _n: string, p: { payload?: { posts?: number } }) => [
                  `${value}%（${p.payload?.posts ?? 0}投稿）`,
                  "平均エンゲージ率",
                ]}
              />
              <Bar dataKey="er" name="平均エンゲージ率" fill="#c08a3e" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function PostTable({ rows }: { rows: IgMetrics["posts"] }) {
  const top = rows.slice(0, 20);
  return (
    <Card title="投稿ランキング（エンゲージ率順）">
      {top.length === 0 ? (
        <p className="text-sm text-black/45">この期間の投稿がありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs text-black/40">
                <th className="pb-2 font-medium">投稿</th>
                <th className="pb-2 font-medium">形式</th>
                <th className="pb-2 font-medium">日付</th>
                <th className="pb-2 text-right font-medium">いいね</th>
                <th className="pb-2 text-right font-medium">コメント</th>
                <th className="pb-2 text-right font-medium">保存</th>
                <th className="pb-2 text-right font-medium">リーチ</th>
                <th className="pb-2 text-right font-medium">エンゲージ率</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-0">
                  <td className="max-w-[200px] truncate py-2 pr-2 text-ink">
                    <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {p.caption || "（キャプションなし）"}
                    </a>
                  </td>
                  <td className="py-2 pr-2 text-black/60">{p.format}</td>
                  <td className="py-2 pr-2 tabular-nums text-black/60">
                    {shortDate(p.date)}（{p.dow}）
                  </td>
                  <td className="py-2 text-right tabular-nums text-black/70">{num(p.likes)}</td>
                  <td className="py-2 text-right tabular-nums text-black/70">{num(p.comments)}</td>
                  <td className="py-2 text-right tabular-nums text-black/70">{p.saved == null ? "—" : num(p.saved)}</td>
                  <td className="py-2 text-right tabular-nums text-black/70">{p.reach == null ? "—" : num(p.reach)}</td>
                  <td className="py-2 text-right tabular-nums font-medium text-ink">{pct(p.engagementRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function DemographicsCard({
  title,
  map,
  note,
  available,
}: {
  title: string;
  map: Record<string, number>;
  note: string | null;
  available: boolean;
}) {
  const rows = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = rows.reduce((s, [, v]) => s + v, 0);
  return (
    <Card title={`フォロワー: ${title}`}>
      {!available || rows.length === 0 ? (
        <p className="text-sm text-black/45">{note ?? "データがありません"}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(([k, v]) => (
            <li key={k} className="text-sm">
              <div className="mb-1 flex justify-between">
                <span className="text-ink">{k}</span>
                <span className="tabular-nums text-black/55">{pct(total > 0 ? (v / total) * 100 : 0)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/5">
                <div className="h-2 rounded-full bg-ink" style={{ width: `${total > 0 ? (v / total) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function AttributionCard({ a, websiteClicks }: { a: IgAttribution; websiteClicks: number | null }) {
  return (
    <Card title="Instagram の売上寄与（簡易アトリビューション）">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Mini label="プロフ→サイトクリック" value={websiteClicks == null ? "—" : num(websiteClicks)} />
        <Mini label="IG経由 注文" value={`${num(a.igOrders)} 件`} sub={pct(a.igOrderShare) + " / 全注文"} />
        <Mini label="IG経由 売上" value={yen(a.igSales)} sub={pct(a.igSalesShare) + " / 全売上"} />
        <Mini label="全注文 / 売上" value={`${num(a.totalOrders)} 件`} sub={yen(a.totalSales)} />
      </div>
      <p className="mt-3 text-xs text-black/45">{a.note}</p>
    </Card>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-paper p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-black/40">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-black/45">{sub}</p>}
    </div>
  );
}

function BenchmarkCard({ benchmark }: { benchmark: IgMetrics["benchmark"] }) {
  const hasCompetitors = benchmark.competitors.length > 0;
  return (
    <Card title="競合ベンチマーク（公開エンゲージメント）">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs text-black/40">
            <th className="pb-2 font-medium">アカウント</th>
            <th className="pb-2 text-right font-medium">フォロワー</th>
            <th className="pb-2 text-right font-medium">平均いいね</th>
            <th className="pb-2 text-right font-medium">平均コメント</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black/5 bg-paper">
            <td className="py-2 pr-2 font-bold text-ink">@{benchmark.self.username}（自社）</td>
            <td className="py-2 text-right tabular-nums text-ink">{num(benchmark.self.followers)}</td>
            <td className="py-2 text-right tabular-nums text-ink">{num(benchmark.self.avgLikes)}</td>
            <td className="py-2 text-right tabular-nums text-ink">{num(benchmark.self.avgComments)}</td>
          </tr>
          {benchmark.competitors.map((c) => (
            <tr key={c.username} className="border-b border-black/5 last:border-0">
              <td className="py-2 pr-2 text-ink">
                @{c.username}
                {c.error && <span className="ml-2 text-xs text-red-500">{c.error}</span>}
              </td>
              <td className="py-2 text-right tabular-nums text-black/70">{c.followers == null ? "—" : num(c.followers)}</td>
              <td className="py-2 text-right tabular-nums text-black/70">{c.avgLikes == null ? "—" : num(c.avgLikes)}</td>
              <td className="py-2 text-right tabular-nums text-black/70">{c.avgComments == null ? "—" : num(c.avgComments)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!hasCompetitors && (
        <p className="mt-3 text-xs text-black/45">
          競合を比較するには env の <code>IG_COMPETITORS</code> にユーザー名をカンマ区切りで設定してください。
        </p>
      )}
      <p className="mt-2 text-xs text-black/45">
        ※ 他社はリーチ・保存・インプレッションを取得できない仕様のため、公開の「いいね/コメント」で比較します。
      </p>
    </Card>
  );
}
