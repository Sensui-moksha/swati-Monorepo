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

export const Route = createFileRoute("/admin/bi/search")({
  head: () => ({ meta: [{ title: "Search Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Search Analytics" description="Query intent, click-throughs and zero-result terms." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Queries (7d)" value="184K" delta={12} />
        <KpiCard label="CTR" value="62%" delta={2} />
        <KpiCard label="Zero-result rate" value="8.4%" delta={-1} />
        <KpiCard label="Avg. results / query" value="24" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Top queries">
          <ul className="space-y-2 text-sm">{[["upsc physics",4820],["indian polity",3420],["current affairs july",2810],["human anatomy",2410],["general english grammar",2120],["ancient history",1980],["swathi weekly",1720],["modern physics pdf",1420]].map(([q,c])=>(
            <li key={q as string} className="flex justify-between border-b border-rule/40 pb-1.5 last:border-0"><span>{q}</span><span className="text-muted-foreground tabular-nums">{(c as number).toLocaleString()}</span></li>
          ))}</ul>
        </Card>
        <Card title="Zero-result queries">
          <ul className="space-y-2 text-sm">{[["geopolitics 2026",214],["quantum computing basics",182],["kannada literature",148],["nda 2 syllabus",124],["bank po english",118],["ssc chsl practice",96]].map(([q,c])=>(
            <li key={q as string} className="flex justify-between border-b border-rule/40 pb-1.5 last:border-0"><span>{q}</span><span className="text-red-700 tabular-nums">{c}</span></li>
          ))}</ul>
        </Card>
      </div>
    </>
  );
}
