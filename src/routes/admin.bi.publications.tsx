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

export const Route = createFileRoute("/admin/bi/publications")({
  head: () => ({ meta: [{ title: "Publications Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Publications Analytics" description="Per-title and per-issue performance." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active titles" value="42" />
        <KpiCard label="Issues shipped (30d)" value="18" delta={4} />
        <KpiCard label="Avg. issue reads" value="24,120" delta={9} />
        <KpiCard label="Downloads (30d)" value="61,204" delta={11} />
      </div>
      <Card title="Issue performance">
        <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["Title","Issue","Reads","Downloads","Rating"].map(h=><th key={h} className="text-left py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{[["Swathi Weekly","No. 187",28420,9120,4.6],["Swathi Weekly","No. 186",26840,8720,4.5],["Swathi Monthly","Jul 2026",18240,6210,4.7],["Special · Elections","Vol. 12",14820,5120,4.8],["Digital · Science","Ed. 34",9840,3210,4.4],["Swathi Weekly","No. 185",24120,7810,4.5]].map((r,i)=>(
          <tr key={i} className="border-t border-rule/40"><td className="py-2">{r[0]}</td><td className="py-2 text-muted-foreground">{r[1]}</td><td className="py-2 tabular-nums">{(r[2] as number).toLocaleString()}</td><td className="py-2 tabular-nums">{(r[3] as number).toLocaleString()}</td><td className="py-2">★ {r[4]}</td></tr>
        ))}</tbody></table>
      </Card>
    </>
  );
}
