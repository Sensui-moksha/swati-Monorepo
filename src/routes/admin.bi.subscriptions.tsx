import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { useSubscriptionAnalytics } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";

export const Route = createFileRoute("/admin/bi/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription Analytics — Swathi Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: analyticsData, isLoading } = useSubscriptionAnalytics();
  const analytics = analyticsData?.data;

  return (
    <>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Subscription Analytics"
        description="Cohorts, MRR, churn and lifetime value."
        actions={<Btn>Export cohort</Btn>}
      />
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <KpiCard
              label="MRR"
              value={formatINR(analytics?.mrr || 0)}
              delta={analytics?.mrrDelta}
            />
            <KpiCard
              label="New subs (30d)"
              value={analytics?.newSubs?.toLocaleString() || "0"}
              delta={analytics?.newSubsDelta}
            />
            <KpiCard
              label="Churned (30d)"
              value={analytics?.churnedSubs?.toLocaleString() || "0"}
              delta={analytics?.churnedSubsDelta}
            />
            <KpiCard
              label="LTV"
              value={formatINR(analytics?.ltv || 0)}
              delta={analytics?.ltvDelta}
            />
            <KpiCard
              label="Trial → paid"
              value={`${analytics?.trialConversionRate || 0}%`}
              delta={analytics?.trialConversionRateDelta}
            />
          </div>
          <Card title="MRR movement · last 6 months" className="mb-6">
            <div className="h-52 flex items-end gap-2">
              {(analytics?.mrrMovement || []).map((v: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${Math.max(v.percentage, 5)}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-2">{formatINR(v.value)}</div>
                  <div className="text-[10px] text-muted-foreground">{v.label}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Retention cohort · monthly" className="mb-6">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left py-1 font-medium">Cohort</th>
                  {["M0", "M1", "M2", "M3", "M4", "M5", "M6"].map((m) => (
                    <th key={m} className="py-1 font-medium">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(analytics?.retentionCohort || []).map((row: any, i: number) => (
                  <tr key={i} className="border-t border-rule/40">
                    <td className="py-1.5 font-medium">{row.cohort}</td>
                    {(row.data as (number | null)[]).map((v, j) => (
                      <td key={j} className="py-1.5 text-center">
                        {v === null ? (
                          <span className="text-muted-foreground/40">—</span>
                        ) : (
                          <span
                            className="inline-block w-12 py-0.5 rounded"
                            style={{ background: `hsl(var(--primary) / ${(v / 100) * 0.4})` }}
                          >
                            {v}%
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Plan distribution">
              <ul className="space-y-3 text-sm">
                {(analytics?.planDistribution || []).map((item: any) => (
                  <li key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">
                        {item.count?.toLocaleString()} subs
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Churn reasons">
              <ul className="space-y-3 text-sm">
                {(analytics?.churnReasons || []).map((item: any) => (
                  <li key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
