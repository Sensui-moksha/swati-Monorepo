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

export const Route = createFileRoute("/admin/bi/payments")({
  head: () => ({ meta: [{ title: "Payment Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Payment Analytics" description="Payment mix, decline reasons, and fraud signals." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Success rate" value="94.2%" delta={-1} />
        <KpiCard label="Failed transactions" value="1,284" delta={12} />
        <KpiCard label="Avg. authorization" value="1.8s" delta={-4} />
        <KpiCard label="Chargebacks" value="₹42,100" delta={8} />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="Payment method mix">
          <ul className="space-y-3 text-sm">{[["UPI",58],["Cards",24],["Netbanking",8],["Wallets",6],["Bank transfer",4]].map(([l,p])=>(
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{p}%</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width:`${p}%`}} /></div></li>
          ))}</ul>
        </Card>
        <Card title="Failure reasons">
          <ul className="space-y-3 text-sm">{[["Insufficient funds",32],["Card declined by issuer",24],["OTP not entered",18],["Payment gateway timeout",12],["Fraud flag",8],["Other",6]].map(([l,p])=>(
            <li key={l as string}><div className="flex justify-between mb-1"><span>{l}</span><span className="text-muted-foreground">{p}%</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{width:`${p}%`}} /></div></li>
          ))}</ul>
        </Card>
      </div>
      <Card title="Fraud signals · last 24h">
        <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["Signal","Count","Risk","Action"].map(h=><th key={h} className="text-left py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{[["Same card, 5+ accounts",4,"High","Blocked"],["Velocity: 12 attempts / 10min",2,"High","Blocked"],["Geolocation mismatch",18,"Medium","Reviewed"],["New device + high value",34,"Low","Approved"]].map((r,i)=>(
          <tr key={i} className="border-t border-rule/40"><td className="py-2">{r[0]}</td><td className="py-2 tabular-nums">{r[1]}</td><td className="py-2">{r[2]}</td><td className="py-2"><StatusPill status={r[3] as string} /></td></tr>
        ))}</tbody></table>
      </Card>
    </>
  );
}
