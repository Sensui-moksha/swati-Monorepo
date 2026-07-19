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

export const Route = createFileRoute("/admin/bi/revenue")({
  head: () => ({ meta: [{ title: "Revenue — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const daily = bars(30, 0.9);
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Revenue Analytics" description="Gross and net revenue across products, channels, and geographies." actions={<><Btn variant="outline">Last 30 days</Btn><Btn>Export CSV</Btn></>} />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Gross revenue" value="₹1.28 Cr" delta={14} />
        <KpiCard label="Refunds" value="₹2.1L" delta={-6} />
        <KpiCard label="Net revenue" value="₹1.26 Cr" delta={15} />
        <KpiCard label="Avg. order value" value="₹412" delta={3} />
      </div>
      <Card title="Daily revenue · 30 days" className="mb-6">
        <div className="h-52 flex items-end gap-1">{daily.map((h, i) => <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${h}%`, opacity: 0.5 + (h/200) }} />)}</div>
        <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Jun 13</span><span>Jun 28</span><span>Jul 13</span></div>
      </Card>
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card title="By product">
          <ul className="space-y-3 text-sm">{[["Subscriptions", 62, "₹79.3L"], ["Books (digital)", 18, "₹23.0L"], ["Books (print)", 12, "₹15.4L"], ["Individual issues", 8, "₹10.2L"]].map(([l, p, v]) => (
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{v}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div></li>
          ))}</ul>
        </Card>
        <Card title="By channel">
          <ul className="space-y-3 text-sm">{[["Web direct", 58, "₹74.2L"], ["Mobile web", 22, "₹28.1L"], ["Institutional invoicing", 12, "₹15.3L"], ["Retail partners", 8, "₹10.2L"]].map(([l, p, v]) => (
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{v}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div></li>
          ))}</ul>
        </Card>
        <Card title="By geography">
          <ul className="space-y-3 text-sm">{[["Tamil Nadu", 34, "₹43.5L"], ["Andhra & Telangana", 28, "₹35.8L"], ["Karnataka", 14, "₹17.9L"], ["Kerala", 9, "₹11.5L"], ["Rest of India", 12, "₹15.4L"], ["Overseas", 3, "₹3.8L"]].map(([l, p, v]) => (
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{v}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div></li>
          ))}</ul>
        </Card>
      </div>
      <Card title="Recent transactions">
        <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["Txn","Customer","Amount","Method","Status","Date"].map((h)=>(<th key={h} className="text-left py-2 font-medium">{h}</th>))}</tr></thead>
        <tbody>{Array.from({length:8}).map((_,i)=>(
          <tr key={i} className="border-t border-rule/40"><td className="py-2 font-mono text-xs">TXN-{20240000+i}</td><td className="py-2">{["Ravi Iyer","Meera S.","Kavita R.","IIT Madras","Nandakumar","A. Krishnan","P. Anand","JNU Library"][i]}</td><td className="py-2 tabular-nums">₹{[899,1499,299,29999,199,449,699,49999][i].toLocaleString()}</td><td className="py-2 text-muted-foreground">{["UPI","Card","UPI","Bank transfer","UPI","Card","UPI","Bank transfer"][i]}</td><td className="py-2"><StatusPill status={["Succeeded","Succeeded","Refunded","Succeeded","Succeeded","Failed","Succeeded","Processing"][i]} /></td><td className="py-2 text-muted-foreground tabular-nums">2026-07-{String(13-i).padStart(2,"0")}</td></tr>
        ))}</tbody></table>
      </Card>
    </>
  );
}
