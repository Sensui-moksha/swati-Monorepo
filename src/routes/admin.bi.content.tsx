import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { useContentAnalytics } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/bi/content")({
  head: () => ({ meta: [{ title: "Content Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { data: analyticsData, isLoading } = useContentAnalytics();
  const analytics = analyticsData?.data;

  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Content Analytics" description="Article and book performance across sections and authors." />
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading analytics...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Articles published (30d)" value={analytics?.articlesPublished?.toLocaleString() || "0"} delta={analytics?.articlesPublishedDelta} />
            <KpiCard label="Avg. read time" value={analytics?.avgReadTime || "0m 0s"} delta={analytics?.avgReadTimeDelta} />
            <KpiCard label="Newsletter CTR" value={`${analytics?.newsletterCtr || 0}%`} delta={analytics?.newsletterCtrDelta} />
            <KpiCard label="Comments / article" value={analytics?.commentsPerArticle?.toFixed(1) || "0.0"} delta={analytics?.commentsPerArticleDelta} />
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card title="By section · reads (7d)">
              <ul className="space-y-3 text-sm">{(analytics?.bySection || []).map((item: any) => (
                <li key={item.label}><div className="flex justify-between mb-1"><span>{item.label}</span><span className="text-muted-foreground tabular-nums">{item.count?.toLocaleString()}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${item.percentage}%`}} /></div></li>
              ))}</ul>
            </Card>
            <Card title="Top authors">
              <ul className="space-y-2 text-sm">{(analytics?.topAuthors || []).map((author: any) => (
                <li key={author.name} className="flex justify-between items-center border-b border-rule/40 pb-1.5 last:border-0"><span>{author.name}</span><span className="text-xs text-muted-foreground">{author.articlesCount} articles · {author.readsCount} reads</span></li>
              ))}</ul>
            </Card>
          </div>
          <Card title="Content pipeline">
            <div className="grid md:grid-cols-5 gap-4 text-sm">{(analytics?.pipeline || []).map((stage: any) => (
              <div key={stage.label} className="border border-rule rounded p-4"><div className="text-xs uppercase tracking-widest text-muted-foreground">{stage.label}</div><div className="font-serif text-2xl mt-1">{stage.count}</div></div>
            ))}</div>
          </Card>
        </>
      )}
    </>
  );
}
