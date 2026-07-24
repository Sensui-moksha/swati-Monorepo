import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, StatusPill, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { usePublishingAnalytics } from "@/lib/api/hooks";

const spark = (data: number[], color = "hsl(var(--primary))") => (
  <svg viewBox={`0 0 ${data.length * 6} 40`} className="w-full h-16">
    <polyline fill="none" stroke={color} strokeWidth="1.5"
      points={data.map((v, i) => `${i * 6},${40 - (v / 100) * 40}`).join(" ")} />
  </svg>
);

export const Route = createFileRoute("/admin/bi/publishing")({
  head: () => ({ meta: [{ title: "Publishing Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { data: analytics, isLoading } = usePublishingAnalytics();
  const data = analytics?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Publishing Analytics" description="Editorial throughput, cycle time, and cadence." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Throughput (30d)" value={data?.throughput?.value || "0 pieces"} delta={data?.throughput?.delta} />
        <KpiCard label="Avg. cycle time" value={data?.cycleTime?.value || "0 days"} delta={data?.cycleTime?.delta} />
        <KpiCard label="On-time publish" value={data?.onTime?.value || "0%"} delta={data?.onTime?.delta} />
        <KpiCard label="Copyedit backlog" value={data?.backlog?.value || "0"} delta={data?.backlog?.delta} />
      </div>
      <Card title="Weekly output · last 12 weeks" className="mb-6">
        <div className="h-40 flex items-end gap-1">
          {data?.weeklyOutput?.map((h: number,i: number)=>(<div key={i} className="flex-1 bg-primary rounded-t" style={{height:`${h}%`}} />))}
        </div>
      </Card>
      <Card title="Editor workload">
        <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["Editor","Assigned","In review","Published","Avg. cycle"].map(h=><th key={h} className="text-left py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>
          {data?.editorWorkload?.map((r: any,i: number)=>(
            <tr key={i} className="border-t border-rule/40"><td className="py-2">{r.name}</td><td className="py-2 tabular-nums">{r.assigned}</td><td className="py-2 tabular-nums">{r.inReview}</td><td className="py-2 tabular-nums">{r.published}</td><td className="py-2 text-muted-foreground">{r.avgCycle}</td></tr>
          ))}
        </tbody></table>
      </Card>
    </>
  );
}
