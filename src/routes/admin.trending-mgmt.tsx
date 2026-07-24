import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill } from "@/components/ui-primitives";
import { useTrendingMgmt } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/trending-mgmt")({
  component: AdminTrendingMgmtPage,
});

function AdminTrendingMgmtPage() {
  const { data, isLoading } = useTrendingMgmt();
  const trending = data?.data ?? [];

  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Trending Management" description="Curate the trending shelf." actions={<Btn>New</Btn>} />
      <div className="flex flex-wrap gap-2 mb-6">
        <input placeholder="Search…" className="border border-rule bg-paper rounded px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select className="border border-rule bg-paper rounded px-3 py-2 text-sm"><option>All statuses</option><option>Active</option><option>Draft</option><option>Archived</option></select>
        <Btn variant="outline">Export CSV</Btn>
      </div>
      <div className="bg-paper border border-rule rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>{["Item","Type","Score","Trend","Updated",""].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
              </thead>
              <tbody>
                {trending.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No trending items found</td></tr>
                ) : (
                  trending.map((t: any) => (
                    <tr key={t.id} className="border-t border-rule/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{t.item?.title || t.name || `Item #${t.id}`}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{t.itemType || "Article"}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{t.score ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${t.trend === 'up' ? 'bg-green-500/10 text-green-500' : t.trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-secondary'}`}>
                          {t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '→'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right"><Btn size="sm" variant="outline">Edit</Btn></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>Showing {trending.length} of {data?.meta?.total ?? trending.length}</span>
              <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
