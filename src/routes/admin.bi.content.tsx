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

export const Route = createFileRoute("/admin/bi/content")({
  head: () => ({ meta: [{ title: "Content Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Content Analytics" description="Article and book performance across sections and authors." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Articles published (30d)" value="284" delta={6} />
        <KpiCard label="Avg. read time" value="4m 12s" delta={3} />
        <KpiCard label="Newsletter CTR" value="24.1%" delta={2} />
        <KpiCard label="Comments / article" value="8.4" delta={12} />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="By section · reads (7d)">
          <ul className="space-y-3 text-sm">{[["Politics",120000],["Business",108000],["Technology",96000],["Science",84000],["Sports",72000],["Culture",60000],["Opinion",48000],["World",36000]].map(([l,v])=>(
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground tabular-nums">{(v as number).toLocaleString()}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${(v as number)/1200}%`}} /></div></li>
          ))}</ul>
        </Card>
        <Card title="Top authors">
          <ul className="space-y-2 text-sm">{[["Dr. Meera Sundaram","24 articles","182K reads"],["Ravi Krishnan","18 articles","148K reads"],["N. Ravi","16 articles","121K reads"],["Kavita Rao","12 articles","98K reads"],["Dr. R. K. Venkatesan","9 articles","74K reads"]].map(([n,a,r])=>(
            <li key={n} className="flex justify-between items-center border-b border-rule/40 pb-1.5 last:border-0"><span>{n}</span><span className="text-xs text-muted-foreground">{a} · {r}</span></li>
          ))}</ul>
        </Card>
      </div>
      <Card title="Content pipeline">
        <div className="grid md:grid-cols-5 gap-4 text-sm">{[["Drafts",42],["In review",18],["Scheduled",24],["Published (today)",12],["Archived (30d)",86]].map(([l,c])=>(
          <div key={l as string} className="border border-rule rounded p-4"><div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div><div className="font-serif text-2xl mt-1">{c}</div></div>
        ))}</div>
      </Card>
    </>
  );
}
