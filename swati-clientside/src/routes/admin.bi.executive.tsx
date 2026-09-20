import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, StatusPill, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { useExecutiveAnalytics } from "@/lib/api/hooks";

const spark = (data: number[], color = "hsl(var(--primary))") => (
  <svg viewBox={`0 0 ${data.length * 6} 40`} className="w-full h-16">
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      points={data.map((v, i) => `${i * 6},${40 - (v / 100) * 40}`).join(" ")}
    />
  </svg>
);

export const Route = createFileRoute("/admin/bi/executive")({
  head: () => ({
    meta: [{ title: "Executive — Swathi Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const { data: analytics, isLoading } = useExecutiveAnalytics();
  const data = analytics?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Executive Dashboard"
        description="Cross-cutting performance across revenue, readership, and content."
        actions={
          <>
            <Btn variant="outline">Last 30 days</Btn>
            <Btn>Export</Btn>
          </>
        }
      />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="ARR"
          value={data?.arr?.value || "₹0"}
          delta={data?.arr?.delta}
          hint={data?.arr?.hint}
        />
        <KpiCard
          label="Active subscribers"
          value={data?.subscribers?.value || "0"}
          delta={data?.subscribers?.delta}
        />
        <KpiCard
          label="Weekly readers"
          value={data?.readers?.value || "0"}
          delta={data?.readers?.delta}
        />
        <KpiCard
          label="Books sold (30d)"
          value={data?.booksSold?.value || "0"}
          delta={data?.booksSold?.delta}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="Revenue trend · 12 weeks">
          <div className="h-48 flex items-end gap-1">
            {data?.revenueTrend?.map((item: any, i: number) => (
              <div
                key={i}
                className="flex-1 bg-primary/70 rounded-t"
                style={{ height: `${item.value}%` }}
                title={`Week ${i + 1}: ₹${item.label}L`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </Card>
        <Card title="Subscription mix">
          <ul className="space-y-3">
            {data?.subscriptionMix?.map((item: any) => (
              <li key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.revenue} · {item.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {data?.kpis?.map((kpi: any) => (
          <Card key={kpi.label}>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {kpi.label}
            </div>
            <div className="mt-2 font-serif text-3xl">{kpi.value}</div>
            <div className={`text-xs mt-1 ${kpi.delta >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {kpi.delta >= 0 ? "▲" : "▼"} {Math.abs(kpi.delta)}%
            </div>
            {spark(kpi.sparkline)}
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Top publications by revenue">
          <table className="w-full text-sm">
            <tbody>
              {data?.topPublications?.map((item: any) => (
                <tr key={item.title} className="border-b border-rule/40 last:border-0">
                  <td className="py-2">{item.title}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">
                    {item.revenue}
                  </td>
                  <td className="py-2 pl-4 w-24">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Alerts & anomalies">
          <ul className="space-y-3 text-sm">
            {data?.alerts?.map((alert: any) => (
              <li
                key={alert.message}
                className="flex items-center justify-between gap-3 border-b border-rule/40 pb-2 last:border-0"
              >
                <div>
                  <div>{alert.message}</div>
                  <div className="text-xs text-muted-foreground">{alert.category}</div>
                </div>
                <StatusPill status={alert.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
