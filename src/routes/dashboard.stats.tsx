import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, KpiCard, Card } from "@/components/ui-primitives";
export const Route = createFileRoute("/dashboard/stats")({
  component: () => (
    <DashboardShell>
      <PageHeader
        eyebrow="Reading"
        title="Reading Statistics"
        description="Your reading habits, visualised."
      />
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total books" value="24" delta={12} />
        <KpiCard label="Pages this month" value="1,842" delta={18} />
        <KpiCard label="Avg. per week" value="4h 12m" />
        <KpiCard label="Longest streak" value="27 days" />
      </div>
      <Card title="Reading over the last 12 weeks">
        <div className="h-40 flex items-end gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/60 rounded-t"
              style={{ height: `${20 + Math.sin(i) * 30 + i * 4}%` }}
            />
          ))}
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card title="Top categories">
          <ul className="space-y-2 text-sm">
            {[
              ["Civil Services", 42],
              ["Science", 28],
              ["History", 18],
              ["Language", 12],
            ].map(([c, p]) => (
              <li key={c as string}>
                <div className="flex justify-between mb-1">
                  <span>{c}</span>
                  <span className="text-muted-foreground">{p}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${p}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Reading times">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Peak:</strong> Sundays, 8–10pm
            </li>
            <li>
              <strong className="text-foreground">Longest session:</strong> 3h 42m (Modern Physics,
              chapter 4)
            </li>
            <li>
              <strong className="text-foreground">Devices:</strong> Desktop 62% · Tablet 28% · Phone
              10%
            </li>
          </ul>
        </Card>
      </div>
    </DashboardShell>
  ),
});
