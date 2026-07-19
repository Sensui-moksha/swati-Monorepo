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

export const Route = createFileRoute("/admin/bi/executive")({
  head: () => ({ meta: [{ title: "Executive — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Executive Dashboard" description="Cross-cutting performance across revenue, readership, and content." actions={<><Btn variant="outline">Last 30 days</Btn><Btn>Export</Btn></>} />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="ARR" value="₹4.82 Cr" delta={18} hint="₹40.2L MRR" />
        <KpiCard label="Active subscribers" value="24,819" delta={9} />
        <KpiCard label="Weekly readers" value="182,340" delta={12} />
        <KpiCard label="Books sold (30d)" value="7,461" delta={-4} />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="Revenue trend · 12 weeks">
          <div className="h-48 flex items-end gap-1">
            {bars(12, 0.7).map((h, i) => <div key={i} className="flex-1 bg-primary/70 rounded-t" style={{ height: `${h}%` }} title={`Week ${i+1}: ₹${(3+i*0.4).toFixed(1)}L`} />)}
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>May</span><span>Jun</span><span>Jul</span></div>
        </Card>
        <Card title="Subscription mix">
          <ul className="space-y-3">
            {[["Digital", 62, "₹2.99 Cr"], ["Digital + Print", 24, "₹1.15 Cr"], ["Institutional", 9, "₹43.4L"], ["Student", 5, "₹24.5L"]].map(([l, p, v]) => (
              <li key={l as string}>
                <div className="flex justify-between text-sm mb-1"><span>{l}</span><span className="text-muted-foreground">{v} · {p}%</span></div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[["Retention (90d)", "91.4%", 2, [45,52,60,68,72,78,82,86,88,90,91,91]], ["ARPU", "₹198", 4, [140,150,160,165,170,175,180,185,188,192,196,198]], ["Churn (monthly)", "2.8%", -8, [45,42,40,38,36,34,32,30,29,28,27,28]]].map(([l, v, d, s]) => (
          <Card key={l as string}>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
            <div className="mt-2 font-serif text-3xl">{v}</div>
            <div className={`text-xs mt-1 ${(d as number) >= 0 ? "text-emerald-700" : "text-red-700"}`}>{(d as number) >= 0 ? "▲" : "▼"} {Math.abs(d as number)}%</div>
            {spark(s as number[])}
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Top publications by revenue">
          <table className="w-full text-sm">
            <tbody>{[["Swathi Weekly", "₹1.24 Cr", 42], ["Modern Physics", "₹68L", 24], ["Indian Polity", "₹52L", 18], ["Advanced Mathematics", "₹41L", 12], ["Human Anatomy", "₹19L", 4]].map(([t, r, p]) => (
              <tr key={t as string} className="border-b border-rule/40 last:border-0"><td className="py-2">{t}</td><td className="py-2 text-right tabular-nums text-muted-foreground">{r}</td><td className="py-2 pl-4 w-24"><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div></td></tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Alerts & anomalies">
          <ul className="space-y-3 text-sm">
            {[["Card decline rate up 3.2%", "Payments", "Flagged"], ["Weekly Issue #187 traffic +48%", "Publications", "Approved"], ["Search zero-results for 'geopolitics'", "Search", "Flagged"], ["Institutional renewals due (32)", "Subscriptions", "Processing"]].map(([m, s, st]) => (
              <li key={m as string} className="flex items-center justify-between gap-3 border-b border-rule/40 pb-2 last:border-0"><div><div>{m}</div><div className="text-xs text-muted-foreground">{s}</div></div><StatusPill status={st as string} /></li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
