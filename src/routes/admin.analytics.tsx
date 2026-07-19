import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, ARTICLES } from "@/lib/mock-data";
import { Card } from "./admin.index";

export const Route = createFileRoute("/admin/analytics")({
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">Reader engagement and content performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Pageviews (7d)" value="1.28M" delta="+9.4%" />
        <StatBox label="Avg. read time" value="4m 12s" delta="+18s" />
        <StatBox label="Bounce rate" value="34.2%" delta="-2.1%" />
        <StatBox label="Newsletter opens" value="62.8%" delta="+3.4%" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Traffic by section">
          <div className="space-y-3">
            {CATEGORIES.map((c, i) => {
              const val = 100 - i * 10;
              return (
                <div key={c.slug}>
                  <div className="flex justify-between text-sm"><span>{c.name}</span><span className="text-muted-foreground">{(val * 1200).toLocaleString()} views</span></div>
                  <div className="mt-1 h-2 bg-secondary rounded"><div className="h-full bg-primary rounded" style={{ width: `${val}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Traffic sources">
          <ul className="text-sm space-y-3">
            {[["Organic search",48],["Direct",22],["Newsletter",15],["Social",10],["Referrals",5]].map(([label, pct]) => (
              <li key={label as string}>
                <div className="flex justify-between"><span>{label}</span><span className="text-muted-foreground">{pct}%</span></div>
                <div className="mt-1 h-2 bg-secondary rounded"><div className="h-full bg-primary rounded" style={{ width: `${pct}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Top articles this week">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground"><tr className="border-b border-rule"><th className="text-left py-2">#</th><th className="text-left">Title</th><th className="text-left">Section</th><th className="text-right">Views</th><th className="text-right">Avg. time</th></tr></thead>
          <tbody>
            {[...ARTICLES].sort((a,b)=>b.views-a.views).slice(0,8).map((a,i) => (
              <tr key={a.id} className="border-b border-rule/60"><td className="py-3">{i+1}</td><td className="max-w-md truncate">{a.title}</td><td>{a.categoryName}</td><td className="text-right">{a.views.toLocaleString()}</td><td className="text-right text-muted-foreground">{3 + (i%4)}m {10 + i}s</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  ),
});

function StatBox({ label, value, delta }: { label: string; value: string; delta: string }) {
  const up = delta.startsWith("+");
  return (
    <div className="bg-paper border border-rule rounded-md p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-3xl">{value}</div>
      <div className={`mt-1 text-xs ${up ? "text-emerald-700" : "text-primary"}`}>{delta} vs prev</div>
    </div>
  );
}
