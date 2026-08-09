import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, StatusPill, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { usePaymentAnalytics } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";

export const Route = createFileRoute("/admin/bi/payments")({
  head: () => ({
    meta: [{ title: "Payment Analytics — Swathi Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const { data: analyticsData, isLoading } = usePaymentAnalytics();
  const analytics = analyticsData?.data;

  return (
    <>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Payment Analytics"
        description="Payment mix, decline reasons, and fraud signals."
      />
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Success rate"
              value={`${analytics?.successRate || 0}%`}
              delta={analytics?.successRateDelta}
            />
            <KpiCard
              label="Failed transactions"
              value={analytics?.failedTransactions?.toLocaleString() || "0"}
              delta={analytics?.failedTransactionsDelta}
            />
            <KpiCard
              label="Avg. authorization"
              value={analytics?.avgAuthorization || "0s"}
              delta={analytics?.avgAuthorizationDelta}
            />
            <KpiCard
              label="Chargebacks"
              value={formatINR(analytics?.chargebacks || 0)}
              delta={analytics?.chargebacksDelta}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card title="Payment method mix">
              <ul className="space-y-3 text-sm">
                {(analytics?.paymentMethods || []).map((item: any) => (
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
            <Card title="Failure reasons">
              <ul className="space-y-3 text-sm">
                {(analytics?.failureReasons || []).map((item: any) => (
                  <li key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card title="Fraud signals · last 24h">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  {["Signal", "Count", "Risk", "Action"].map((h) => (
                    <th key={h} className="text-left py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(analytics?.fraudSignals || []).map((r: any, i: number) => (
                  <tr key={i} className="border-t border-rule/40">
                    <td className="py-2">{r.signal}</td>
                    <td className="py-2 tabular-nums">{r.count}</td>
                    <td className="py-2">{r.risk}</td>
                    <td className="py-2">
                      <StatusPill status={r.action} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  );
}
