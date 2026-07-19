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

export const Route = createFileRoute("/admin/bi/subscriptions")({
  head: () => ({ meta: [{ title: "Subscription Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Subscription Analytics" description="Cohorts, MRR, churn and lifetime value." actions={<Btn>Export cohort</Btn>} />
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <KpiCard label="MRR" value="₹40.2L" delta={6} />
        <KpiCard label="New subs (30d)" value="1,842" delta={11} />
        <KpiCard label="Churned (30d)" value="612" delta={-4} />
        <KpiCard label="LTV" value="₹4,120" delta={7} />
        <KpiCard label="Trial → paid" value="46%" delta={3} />
      </div>
      <Card title="MRR movement · last 6 months" className="mb-6">
        <div className="h-52 flex items-end gap-2">{[28,30,32,33,36,40].map((v,i)=>(
          <div key={i} className="flex-1 flex flex-col items-center"><div className="w-full bg-primary rounded-t" style={{height:`${v*2}%`}} /><div className="text-xs text-muted-foreground mt-2">₹{v}L</div><div className="text-[10px] text-muted-foreground">{["Feb","Mar","Apr","May","Jun","Jul"][i]}</div></div>
        ))}</div>
      </Card>
      <Card title="Retention cohort · monthly" className="mb-6">
        <table className="w-full text-xs"><thead className="text-muted-foreground"><tr><th className="text-left py-1 font-medium">Cohort</th>{["M0","M1","M2","M3","M4","M5","M6"].map(m=><th key={m} className="py-1 font-medium">{m}</th>)}</tr></thead>
        <tbody>{[["Jan '26",100,92,88,86,84,83,82],["Feb '26",100,94,90,88,86,85,null],["Mar '26",100,93,89,87,85,null,null],["Apr '26",100,95,91,89,null,null,null],["May '26",100,94,90,null,null,null,null],["Jun '26",100,93,null,null,null,null,null],["Jul '26",100,null,null,null,null,null,null]].map((row,i)=>(
          <tr key={i} className="border-t border-rule/40"><td className="py-1.5 font-medium">{row[0]}</td>{(row.slice(1) as (number|null)[]).map((v,j)=>(
            <td key={j} className="py-1.5 text-center">{v===null?<span className="text-muted-foreground/40">—</span>:<span className="inline-block w-12 py-0.5 rounded" style={{background:`hsl(var(--primary) / ${(v/100)*0.4})`}}>{v}%</span>}</td>
          ))}</tr>
        ))}</tbody></table>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Plan distribution">
          <ul className="space-y-3 text-sm">{[["Digital · Monthly", 34, "8,438"],["Digital · Annual", 28, "6,949"],["Digital + Print · Annual", 22, "5,460"],["Student · Annual", 10, "2,482"],["Institutional", 6, "1,490"]].map(([l,p,c])=>(
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{c} subs</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${p}%`}} /></div></li>
          ))}</ul>
        </Card>
        <Card title="Churn reasons">
          <ul className="space-y-3 text-sm">{[["Too expensive", 34],["Not reading enough", 28],["Missing features", 14],["Payment failed", 12],["Switched to competitor", 8],["Other", 4]].map(([l,p])=>(
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{p}%</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{width:`${p}%`}} /></div></li>
          ))}</ul>
        </Card>
      </div>
    </>
  );
}
