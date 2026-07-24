import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Card, StatusPill, Btn } from "@/components/ui-primitives";
import { PageHeader } from "@/components/ui-primitives";
import { useRevenueAnalytics, useRecentTransactions } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";

const spark = (data: number[], color = "hsl(var(--primary))") => (
  <svg viewBox={`0 0 ${data.length * 6} 40`} className="w-full h-16">
    <polyline fill="none" stroke={color} strokeWidth="1.5"
      points={data.map((v, i) => `${i * 6},${40 - (v / 100) * 40}`).join(" ")} />
  </svg>
);

export const Route = createFileRoute("/admin/bi/revenue")({
  head: () => ({ meta: [{ title: "Revenue — Swathi Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { data: analyticsData, isLoading } = useRevenueAnalytics();
  const { data: txData, isLoading: txLoading } = useRecentTransactions();

  const analytics = analyticsData?.data;
  const transactions = txData?.data ?? [];
  const daily = analytics?.daily || [];

  return (
    <>
      <PageHeader eyebrow="Business Intelligence" title="Revenue Analytics" description="Gross and net revenue across products, channels, and geographies." actions={<><Btn variant="outline">Last 30 days</Btn><Btn>Export CSV</Btn></>} />
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading analytics...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Gross revenue" value={formatINR(analytics?.grossRevenue || 0)} delta={analytics?.grossRevenueDelta} />
            <KpiCard label="Refunds" value={formatINR(analytics?.refunds || 0)} delta={analytics?.refundsDelta} />
            <KpiCard label="Net revenue" value={formatINR(analytics?.netRevenue || 0)} delta={analytics?.netRevenueDelta} />
            <KpiCard label="Avg. order value" value={formatINR(analytics?.aov || 0)} delta={analytics?.aovDelta} />
          </div>
          <Card title="Daily revenue · 30 days" className="mb-6">
            <div className="h-52 flex items-end gap-1">{daily.map((h: any, i: number) => <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${h.value}%`, opacity: 0.5 + (h.value/200) }} title={`${formatINR(h.amount)} on ${h.date}`} />)}</div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{daily[0]?.date}</span><span>{daily[Math.floor(daily.length/2)]?.date}</span><span>{daily[daily.length-1]?.date}</span></div>
          </Card>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card title="By product">
              <ul className="space-y-3 text-sm">{(analytics?.byProduct || []).map((item: any) => (
                <li key={item.label}><div className="flex justify-between mb-1"><span>{item.label}</span><span className="text-muted-foreground">{formatINR(item.value)}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} /></div></li>
              ))}</ul>
            </Card>
            <Card title="By channel">
              <ul className="space-y-3 text-sm">{(analytics?.byChannel || []).map((item: any) => (
                <li key={item.label}><div className="flex justify-between mb-1"><span>{item.label}</span><span className="text-muted-foreground">{formatINR(item.value)}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} /></div></li>
              ))}</ul>
            </Card>
            <Card title="By geography">
              <ul className="space-y-3 text-sm">{(analytics?.byGeography || []).map((item: any) => (
                <li key={item.label}><div className="flex justify-between mb-1"><span>{item.label}</span><span className="text-muted-foreground">{formatINR(item.value)}</span></div><div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} /></div></li>
              ))}</ul>
            </Card>
          </div>
          <Card title="Recent transactions">
            {txLoading ? (
               <div className="p-4 text-center text-muted-foreground animate-pulse">Loading transactions...</div>
            ) : (
              <table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-muted-foreground"><tr>{["Txn","Customer","Amount","Method","Status","Date"].map((h)=>(<th key={h} className="text-left py-2 font-medium">{h}</th>))}</tr></thead>
              <tbody>{transactions.length === 0 ? <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No recent transactions</td></tr> : transactions.map((t: any) => (
                <tr key={t.id} className="border-t border-rule/40"><td className="py-2 font-mono text-xs">{t.txnId}</td><td className="py-2">{t.customer?.name}</td><td className="py-2 tabular-nums">{formatINR(t.amount)}</td><td className="py-2 text-muted-foreground capitalize">{t.method}</td><td className="py-2"><StatusPill status={t.status} /></td><td className="py-2 text-muted-foreground tabular-nums">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</td></tr>
              ))}</tbody></table>
            )}
          </Card>
        </>
      )}
    </>
  );
}
