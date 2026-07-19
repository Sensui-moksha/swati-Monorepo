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

export const Route = createFileRoute("/admin/bi/users")({
  head: () => ({ meta: [{ title: "User Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="User Analytics" description="Reader base, activation, engagement and geographic split." actions={<Btn>Segment builder</Btn>} />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total readers" value="182,340" delta={9} />
        <KpiCard label="MAU" value="94,120" delta={12} />
        <KpiCard label="WAU / MAU" value="0.61" delta={3} hint="Engagement ratio" />
        <KpiCard label="New signups (30d)" value="8,428" delta={22} />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="DAU · 30 days">
          <div className="h-40 flex items-end gap-1">{bars(30,0.6).map((h,i)=>(<div key={i} className="flex-1 bg-primary rounded-t" style={{height:`${h}%`}} />))}</div>
        </Card>
        <Card title="Activation funnel">
          <ul className="space-y-3 text-sm">{[["Visited",100,"182,340"],["Signed up",23,"41,938"],["Read first article",18,"32,821"],["Saved / bookmarked",11,"20,058"],["Subscribed",5,"9,117"]].map(([l,p,c])=>(
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{c} · {p}%</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${p}%`}} /></div></li>
          ))}</ul>
        </Card>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Devices">
          <ul className="space-y-2 text-sm">{[["Mobile web",48],["Desktop",34],["Tablet",12],["App",6]].map(([l,p])=><li key={l as string} className="flex justify-between"><span>{l}</span><span className="text-muted-foreground">{p}%</span></li>)}</ul>
        </Card>
        <Card title="Age groups">
          <ul className="space-y-2 text-sm">{[["18–24",22],["25–34",34],["35–44",24],["45–54",12],["55+",8]].map(([l,p])=><li key={l as string} className="flex justify-between"><span>{l}</span><span className="text-muted-foreground">{p}%</span></li>)}</ul>
        </Card>
        <Card title="Top cities">
          <ul className="space-y-2 text-sm">{[["Chennai","24,120"],["Hyderabad","18,940"],["Bengaluru","16,210"],["Vijayawada","12,480"],["Kochi","9,320"],["Delhi","7,120"]].map(([l,c])=><li key={l as string} className="flex justify-between"><span>{l}</span><span className="text-muted-foreground">{c}</span></li>)}</ul>
        </Card>
      </div>
    </>
  );
}
