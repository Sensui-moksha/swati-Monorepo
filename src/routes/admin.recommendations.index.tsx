import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill, KpiCard, Card } from "@/components/ui-primitives";
export const Route = createFileRoute("/admin/recommendations/")({
  component: () => (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Recommendations" description="Recommendation engine overview." />
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[["Total","12,482","+8"],["Active","9,201","+3"],["Pending","348","-12"],["This week","1,204","+22"]].map(([l,v,d])=>(
          <KpiCard key={l as string} label={l as string} value={v as string} delta={Number(d)} />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Trend (last 30 days)">
          <div className="h-40 flex items-end gap-1">{Array.from({length:30}).map((_,i)=>(<div key={i} className="flex-1 bg-primary/60 rounded-t" style={{height:`${20+Math.sin(i/3)*30+i*1.5}%`}} />))}</div>
        </Card>
        <Card title="Breakdown">
          <ul className="space-y-2 text-sm">{[["Segment A",42],["Segment B",28],["Segment C",18],["Segment D",12]].map(([c,p])=>(
            <li key={c as string}><div className="flex justify-between mb-1"><span>{c}</span><span className="text-muted-foreground">{p}%</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${p}%`}} /></div></li>
          ))}</ul>
        </Card>
      </div>
    </AdminShell>
  ),
});
