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

export const Route = createFileRoute("/admin/bi/reading")({
  head: () => ({ meta: [{ title: "Reading Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Reading Analytics" description="What readers open, how far they read, and where they drop off." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Sessions (7d)" value="412K" delta={8} />
        <KpiCard label="Avg. read time" value="4m 12s" delta={5} />
        <KpiCard label="Completion rate" value="38.4%" delta={-2} />
        <KpiCard label="Highlights created" value="18,240" delta={12} />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="Read depth distribution">
          <ul className="space-y-3 text-sm">{[["0–25%",22],["25–50%",28],["50–75%",26],["75–99%",14],["Completed",10]].map(([l,p])=>(
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{p}%</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${(p as number)*3}%`}} /></div></li>
          ))}</ul>
        </Card>
        <Card title="Peak reading hours">
          <div className="h-40 flex items-end gap-1">{[10,8,6,4,3,5,12,22,28,32,35,38,42,44,40,36,30,26,32,45,58,64,52,32].map((v,i)=>(<div key={i} className="flex-1 bg-primary/70 rounded-t" style={{height:`${v}%`}} title={`${i}:00 · ${v}%`} />))}</div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
        </Card>
      </div>
      <Card title="Most read this week">
        <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["#","Title","Section","Opens","Complete","Avg. time"].map(h=><th key={h} className="text-left py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{[["An Editor's Note on Truth in Slow Journalism","Opinion",4817,52,"3m 10s"],["The Long Road to Cleaner Urban Air","Science",4470,48,"4m 11s"],["Chipmakers Chart a Post-Subsidy Landscape","Technology",4123,41,"5m 12s"],["Housing Finance Firms Under a New Rulebook","Business",3776,44,"6m 13s"],["Diplomacy in the Shadow of Elections","World",3429,39,"3m 14s"],["Why the Coalition Math Suddenly Matters Again","Opinion",3082,46,"4m 15s"],["The Return of the Regional Bookshop","Culture",2735,54,"5m 16s"]].map((r,i)=>(
          <tr key={i} className="border-t border-rule/40"><td className="py-2 text-muted-foreground">{i+1}</td><td className="py-2">{r[0]}</td><td className="py-2 text-muted-foreground">{r[1]}</td><td className="py-2 tabular-nums">{(r[2] as number).toLocaleString()}</td><td className="py-2 tabular-nums">{r[3]}%</td><td className="py-2 text-muted-foreground">{r[4]}</td></tr>
        ))}</tbody></table>
      </Card>
    </>
  );
}
