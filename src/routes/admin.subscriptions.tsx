import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_USERS, formatINR } from "@/lib/mock-data";
import { Card, StatusBadge } from "./admin.index";

export const Route = createFileRoute("/admin/subscriptions")({
  component: () => {
    const subs = ADMIN_USERS.filter((u) => u.plan !== "Free");
    const mrr = subs.reduce((s, u) => s + (u.plan === "Digital" ? 199 : u.plan === "Digital + Print" ? 449 : 1999), 0);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Active recurring plans and lifecycle</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox label="Active subs" value={subs.length.toLocaleString()} />
          <StatBox label="MRR" value={formatINR(mrr)} />
          <StatBox label="Churn (30d)" value="2.4%" />
          <StatBox label="Trial users" value="1,204" />
        </div>
        <Card title="Active subscriptions">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground"><tr className="border-b border-rule"><th className="text-left py-2">Subscriber</th><th className="text-left">Plan</th><th className="text-left">Started</th><th className="text-left">Next billing</th><th className="text-left">Status</th></tr></thead>
            <tbody>
              {subs.map((u) => (
                <tr key={u.id} className="border-b border-rule/60 hover:bg-secondary/30">
                  <td className="py-3">{u.name}<div className="text-xs text-muted-foreground">{u.email}</div></td>
                  <td><StatusBadge status={u.plan} /></td>
                  <td className="text-muted-foreground text-xs">{u.joined}</td>
                  <td className="text-muted-foreground text-xs">2026-08-11</td>
                  <td><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  },
});

function StatBox({ label, value }: { label: string; value: string }) {
  return <div className="bg-paper border border-rule rounded-md p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-2 font-serif text-3xl">{value}</div></div>;
}
