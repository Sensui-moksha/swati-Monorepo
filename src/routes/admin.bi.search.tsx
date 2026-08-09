import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { useSearchAnalytics } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/bi/search")({
  head: () => ({
    meta: [{ title: "Search Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const { data: analyticsData, isLoading } = useSearchAnalytics();
  const analytics = analyticsData?.data;

  return (
    <>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Search Analytics"
        description="Query intent, click-throughs and zero-result terms."
      />
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Queries (7d)"
              value={analytics?.queries?.toLocaleString() || "0"}
              delta={analytics?.queriesDelta}
            />
            <KpiCard label="CTR" value={`${analytics?.ctr || 0}%`} delta={analytics?.ctrDelta} />
            <KpiCard
              label="Zero-result rate"
              value={`${analytics?.zeroResultRate || 0}%`}
              delta={analytics?.zeroResultRateDelta}
            />
            <KpiCard
              label="Avg. results / query"
              value={analytics?.avgResultsPerQuery?.toString() || "0"}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Top queries">
              <ul className="space-y-2 text-sm">
                {(analytics?.topQueries || []).map((item: any) => (
                  <li
                    key={item.query}
                    className="flex justify-between border-b border-rule/40 pb-1.5 last:border-0"
                  >
                    <span>{item.query}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {item.count?.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Zero-result queries">
              <ul className="space-y-2 text-sm">
                {(analytics?.zeroResultQueries || []).map((item: any) => (
                  <li
                    key={item.query}
                    className="flex justify-between border-b border-rule/40 pb-1.5 last:border-0"
                  >
                    <span>{item.query}</span>
                    <span className="text-red-700 tabular-nums">
                      {item.count?.toLocaleString()}
                    </span>
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
