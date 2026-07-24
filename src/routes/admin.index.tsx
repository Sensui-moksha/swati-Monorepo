import { createFileRoute } from "@tanstack/react-router";
import { useAdminStats, useAdminPayments, useArticles, useRevenueTrend, usePlanBreakdown } from "@/lib/api/hooks";
import { formatINR, formatShortDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: statsData } = useAdminStats();
  const { data: paymentsData } = useAdminPayments({ limit: 6 });
  const { data: articlesData } = useArticles({ limit: 6 });

  const stats = statsData?.data;
  const payments = paymentsData?.data ?? [];
  const articles = articlesData?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of platform performance · Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Revenue" value={formatINR(stats?.totalRevenue ?? payments.reduce((sum: number, p: any) => sum + (p.total || 0), 0))} delta={0} icon={DollarSign} />
        <Kpi label="Active users" value={stats?.activeUsers?.toLocaleString() ?? '—'} delta={0} icon={Users} />
        <Kpi label="New users" value={stats?.newUsers?.toLocaleString() ?? '—'} delta={0} icon={Eye} />
        <Kpi label="Total users" value={stats?.totalUsers?.toLocaleString() ?? '—'} delta={0} icon={FileText} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Revenue trend" className="lg:col-span-2">
          <SparkChart />
        </Card>
        <Card title="Plan breakdown">
          <PlanBreakdown />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Recent orders">
          {payments.length === 0 ? (
            <div className="py-4 text-xs text-muted-foreground text-center">No recent orders</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-rule"><th className="text-left py-2">ID</th><th className="text-left">Status</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p._id || p.id || p.orderNumber} className="border-b border-rule/60">
                    <td className="py-2 font-mono text-xs">{p.orderNumber}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="text-right">{formatINR(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Top performing articles">
          {articles.length === 0 ? (
            <div className="py-4 text-xs text-muted-foreground text-center">No articles available</div>
          ) : (
            <ul className="divide-y divide-rule text-sm">
              {articles.map((a: any) => (
                <li key={a._id || a.id || a.title} className="py-2.5 flex justify-between gap-4">
                  <span className="truncate">{a.title}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">{(a.viewCount ?? 0).toLocaleString()} views · {a.publishedAt ? formatShortDate(a.publishedAt) : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, icon: Icon }: any) {
  const up = delta >= 0;
  return (
    <div className="bg-paper border border-rule rounded-md p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
      {delta !== 0 && (
        <div className={`mt-1 text-xs inline-flex items-center gap-1 ${up ? "text-emerald-700" : "text-primary"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-paper border border-rule rounded-md ${className}`}>
      <div className="px-5 py-3 rule-bottom font-serif text-lg">{title}</div>
      <div className="p-5 overflow-x-auto">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Succeeded: "bg-emerald-100 text-emerald-800",
    Active: "bg-emerald-100 text-emerald-800",
    Approved: "bg-emerald-100 text-emerald-800",
    completed: "bg-emerald-100 text-emerald-800",
    active: "bg-emerald-100 text-emerald-800",
    Failed: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
    Refunded: "bg-amber-100 text-amber-800",
    refunded: "bg-amber-100 text-amber-800",
    Flagged: "bg-amber-100 text-amber-800",
    Suspended: "bg-red-100 text-red-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    Free: "bg-secondary text-foreground/70",
  };
  return <span className={`inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${colors[status] ?? "bg-secondary"}`}>{status}</span>;
}

function SparkChart() {
  const { data: trendData } = useRevenueTrend();
  const rawData: number[] = Array.isArray(trendData?.data) ? trendData.data : [42, 55, 48, 62, 71, 58, 74, 82, 76, 88, 95, 92, 105, 118];
  const data = rawData.length ? rawData : [10, 20, 30];
  const max = Math.max(...data, 1);
  const w = 600, h = 180, step = w / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => `${i * step},${h - (d / max) * (h - 20) - 10}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
      <polygon points={area} fill="url(#g)" />
      <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth={2} />
    </svg>
  );
}

function PlanBreakdown() {
  const { data: planData } = usePlanBreakdown();
  const apiRows = planData?.data;
  const rows = Array.isArray(apiRows) && apiRows.length > 0
    ? apiRows.map((r: any, i: number) => ({ name: r.name || r.plan, value: r.value || r.percentage || 0, color: i === 0 ? "bg-primary" : i === 1 ? "bg-primary/70" : i === 2 ? "bg-primary/40" : "bg-primary/20" }))
    : [
        { name: "Digital + Print", value: 42, color: "bg-primary" },
        { name: "Digital", value: 38, color: "bg-primary/70" },
        { name: "Institutional", value: 12, color: "bg-primary/40" },
        { name: "Free", value: 8, color: "bg-primary/20" },
      ];
  return (
    <div className="space-y-3">
      {rows.map((r: any) => (
        <div key={r.name}>
          <div className="flex justify-between text-sm"><span>{r.name}</span><span className="text-muted-foreground">{r.value}%</span></div>
          <div className="mt-1 h-2 bg-secondary rounded"><div className={`h-full ${r.color} rounded`} style={{ width: `${r.value}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
