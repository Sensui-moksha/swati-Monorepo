import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { useUserAnalytics } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/bi/users")({
  head: () => ({
    meta: [{ title: "User Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const { data: analyticsData, isLoading } = useUserAnalytics();
  const analytics = analyticsData?.data;
  const daily = analytics?.dailyActiveUsers || [];

  return (
    <>
      <PageHeader
        eyebrow="Business Intelligence"
        title="User Analytics"
        description="Reader base, activation, engagement and geographic split."
        actions={<Btn>Segment builder</Btn>}
      />
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Total readers"
              value={analytics?.totalReaders?.toLocaleString() || "0"}
              delta={analytics?.totalReadersDelta}
            />
            <KpiCard
              label="MAU"
              value={analytics?.mau?.toLocaleString() || "0"}
              delta={analytics?.mauDelta}
            />
            <KpiCard
              label="WAU / MAU"
              value={analytics?.wauMauRatio?.toFixed(2) || "0.00"}
              delta={analytics?.wauMauDelta}
              hint="Engagement ratio"
            />
            <KpiCard
              label="New signups (30d)"
              value={analytics?.newSignups?.toLocaleString() || "0"}
              delta={analytics?.newSignupsDelta}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card title="DAU · 30 days">
              <div className="h-40 flex items-end gap-1">
                {daily.map((h: any, i: number) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary rounded-t"
                    style={{ height: `${h.percentage}%` }}
                    title={`${h.value} on ${h.date}`}
                  />
                ))}
              </div>
            </Card>
            <Card title="Activation funnel">
              <ul className="space-y-3 text-sm">
                {(analytics?.activationFunnel || []).map((step: any) => (
                  <li key={step.label}>
                    <div className="flex justify-between mb-1">
                      <span>{step.label}</span>
                      <span className="text-muted-foreground">
                        {step.count?.toLocaleString()} · {step.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${step.percentage}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="Devices">
              <ul className="space-y-2 text-sm">
                {(analytics?.byDevice || []).map((item: any) => (
                  <li key={item.label} className="flex justify-between">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Age groups">
              <ul className="space-y-2 text-sm">
                {(analytics?.byAge || []).map((item: any) => (
                  <li key={item.label} className="flex justify-between">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Top cities">
              <ul className="space-y-2 text-sm">
                {(analytics?.byCity || []).map((item: any) => (
                  <li key={item.label} className="flex justify-between">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.count?.toLocaleString()}</span>
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
