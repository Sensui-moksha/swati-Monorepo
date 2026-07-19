import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_PAYMENTS, formatINR } from "@/lib/mock-data";
import { Card, StatusBadge } from "./admin.index";

export const Route = createFileRoute("/admin/payments")({
  component: () => {
    const succeeded = ADMIN_PAYMENTS.filter((p) => p.status === "Succeeded");
    const gross = succeeded.reduce((s, p) => s + p.amount, 0);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl">Payments</h1>
          <p className="text-sm text-muted-foreground">Transactions across UPI, card, and bank</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox label="Gross (30d)" value={formatINR(gross)} />
          <StatBox label="Transactions" value={ADMIN_PAYMENTS.length.toString()} />
          <StatBox label="Refund rate" value="1.2%" />
          <StatBox label="Failed" value={ADMIN_PAYMENTS.filter((p) => p.status === "Failed").length.toString()} />
        </div>
        <Card title="Recent transactions">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground"><tr className="border-b border-rule"><th className="text-left py-2">Transaction</th><th className="text-left">User</th><th className="text-left">Method</th><th className="text-right">Amount</th><th className="text-left">Status</th><th className="text-left">Date</th></tr></thead>
            <tbody>
              {ADMIN_PAYMENTS.map((p) => (
                <tr key={p.id} className="border-b border-rule/60 hover:bg-secondary/30">
                  <td className="py-3 font-mono text-xs">{p.id}</td>
                  <td>{p.user}</td>
                  <td className="text-muted-foreground">{p.method}</td>
                  <td className="text-right">{formatINR(p.amount)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="text-muted-foreground text-xs">{p.date}</td>
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
