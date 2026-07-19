import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, StatusPill, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";

const bars = (n: number, seed = 1) => Array.from({ length: n }, (_, i) => 20 + Math.abs(Math.sin(i * seed)) * 60 + (i % 5) * 3);
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
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Publishing Analytics" description="Editorial throughput, cycle time, and cadence." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Throughput (30d)" value="284 pieces" delta={9} />
        <KpiCard label="Avg. cycle time" value="3.4 days" delta={-8} />
        <KpiCard label="On-time publish" value="92%" delta={3} />
        <KpiCard label="Copyedit backlog" value="18" delta={-12} />
      </div>
      <Card title="Weekly output · last 12 weeks" className="mb-6">
        <div className="h-40 flex items-end gap-1">{bars(12,0.5).map((h,i)=>(<div key={i} className="flex-1 bg-primary rounded-t" style={{height:`${h}%`}} />))}</div>
      </Card>
      <Card title="Editor workload">
        <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["Editor","Assigned","In review","Published","Avg. cycle"].map(h=><th key={h} className="text-left py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{[["N. Ravi",18,4,42,"2.8d"],["S. Krishnan",14,3,38,"3.1d"],["M. Sundaram",12,2,34,"3.4d"],["R. Iyer",16,5,29,"4.2d"],["K. Rao",10,1,26,"3.0d"]].map((r,i)=>(
          <tr key={i} className="border-t border-rule/40"><td className="py-2">{r[0]}</td><td className="py-2 tabular-nums">{r[1]}</td><td className="py-2 tabular-nums">{r[2]}</td><td className="py-2 tabular-nums">{r[3]}</td><td className="py-2 text-muted-foreground">{r[4]}</td></tr>
        ))}</tbody></table>
      </Card>
    </>
  );
}
