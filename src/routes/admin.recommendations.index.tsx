import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill, KpiCard, Card } from "@/components/ui-primitives";
import { useRecommendationsAnalytics } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/recommendations/")({
  component: Page,
});

function Page() {
  const { data: analytics, isLoading } = useRecommendationsAnalytics();
  const data = analytics?.data;

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin"
        title="Recommendations"
        description="Recommendation engine overview."
      />
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total" value={data?.total?.value || "0"} delta={data?.total?.delta} />
        <KpiCard label="Active" value={data?.active?.value || "0"} delta={data?.active?.delta} />
        <KpiCard label="Pending" value={data?.pending?.value || "0"} delta={data?.pending?.delta} />
        <KpiCard
          label="This week"
          value={data?.thisWeek?.value || "0"}
          delta={data?.thisWeek?.delta}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Trend (last 30 days)">
          <div className="h-40 flex items-end gap-1">
            {data?.trend?.map((h: number, i: number) => (
              <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Card>
        <Card title="Breakdown">
          <ul className="space-y-2 text-sm">
            {data?.breakdown?.map((item: any) => (
              <li key={item.label}>
                <div className="flex justify-between mb-1">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}
