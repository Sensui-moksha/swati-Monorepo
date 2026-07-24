import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { usePublicationAnalytics } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/bi/publications")({
  head: () => ({ meta: [{ title: "Publications Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { data: analyticsData, isLoading } = usePublicationAnalytics();
  const analytics = analyticsData?.data;

  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Publications Analytics" description="Per-title and per-issue performance." />
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading analytics...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Active titles" value={analytics?.activeTitles?.toString() || "0"} delta={analytics?.activeTitlesDelta} />
            <KpiCard label="Issues shipped (30d)" value={analytics?.issuesShipped?.toString() || "0"} delta={analytics?.issuesShippedDelta} />
            <KpiCard label="Avg. issue reads" value={analytics?.avgIssueReads?.toLocaleString() || "0"} delta={analytics?.avgIssueReadsDelta} />
            <KpiCard label="Downloads (30d)" value={analytics?.downloads?.toLocaleString() || "0"} delta={analytics?.downloadsDelta} />
          </div>
          <Card title="Issue performance">
            <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["Title","Issue","Reads","Downloads","Rating"].map(h=><th key={h} className="text-left py-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>{(analytics?.issuePerformance || []).map((r: any, i: number)=>(
              <tr key={i} className="border-t border-rule/40"><td className="py-2">{r.title}</td><td className="py-2 text-muted-foreground">{r.issue}</td><td className="py-2 tabular-nums">{r.reads?.toLocaleString()}</td><td className="py-2 tabular-nums">{r.downloads?.toLocaleString()}</td><td className="py-2">★ {r.rating?.toFixed(1)}</td></tr>
            ))}</tbody></table>
          </Card>
        </>
      )}
    </>
  );
}
