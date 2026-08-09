import { createFileRoute } from "@tanstack/react-router";
import { useAdminPayments } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";
import { Card, StatusBadge } from "./admin.index";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const { data, isLoading } = useAdminPayments();
  const orders = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Payments</h1>
        <p className="text-sm text-muted-foreground">Recent transactions and payment activity</p>
      </div>
      <Card title="All payments">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-rule">
                <th className="text-left py-2">Order</th>
                <th className="text-left">Status</th>
                <th className="text-right">Amount</th>
                <th className="text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-rule/60 hover:bg-secondary/30">
                  <td className="py-2 font-mono text-xs">{o.orderNumber}</td>
                  <td>
                    <StatusBadge status={o.paymentStatus ?? o.status} />
                  </td>
                  <td className="text-right">{formatINR(o.total)}</td>
                  <td className="text-muted-foreground text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
