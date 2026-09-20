import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, StatusPill, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { useReadingAnalytics } from "@/lib/api/hooks";

const spark = (data: number[], color = "hsl(var(--primary))") => (
  <svg viewBox={`0 0 ${data.length * 6} 40`} className="w-full h-16">
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      points={data.map((v, i) => `${i * 6},${40 - (v / 100) * 40}`).join(" ")}
    />
  </svg>
);

export const Route = createFileRoute("/admin/bi/reading")({
  head: () => ({
    meta: [{ title: "Reading Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const { data: analytics, isLoading } = useReadingAnalytics();
  const data = analytics?.data;

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Reading Analytics"
        description="What readers open, how far they read, and where they drop off."
      />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Sessions (7d)"
          value={data?.sessions?.value || "0"}
          delta={data?.sessions?.delta}
        />
        <KpiCard
          label="Avg. read time"
          value={data?.avgReadTime?.value || "0s"}
          delta={data?.avgReadTime?.delta}
        />
        <KpiCard
          label="Completion rate"
          value={data?.completionRate?.value || "0%"}
          delta={data?.completionRate?.delta}
        />
        <KpiCard
          label="Highlights created"
          value={data?.highlights?.value || "0"}
          delta={data?.highlights?.delta}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="Read depth distribution">
          <ul className="space-y-3 text-sm">
            {data?.readDepth?.map((item: any) => (
              <li key={item.label}>
                <div className="flex justify-between mb-1">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Peak reading hours">
          <div className="h-40 flex items-end gap-1">
            {data?.peakHours?.map((v: number, i: number) => (
              <div
                key={i}
                className="flex-1 bg-primary/70 rounded-t"
                style={{ height: `${v}%` }}
                title={`${i}:00 · ${v}%`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </Card>
      </div>
      <Card title="Most read this week">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              {["#", "Title", "Section", "Opens", "Complete", "Avg. time"].map((h) => (
                <th key={h} className="text-left py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.mostRead?.map((r: any, i: number) => (
              <tr key={i} className="border-t border-rule/40">
                <td className="py-2 text-muted-foreground">{i + 1}</td>
                <td className="py-2">{r.title}</td>
                <td className="py-2 text-muted-foreground">{r.section}</td>
                <td className="py-2 tabular-nums">{r.opens.toLocaleString()}</td>
                <td className="py-2 tabular-nums">{r.complete}%</td>
                <td className="py-2 text-muted-foreground">{r.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
