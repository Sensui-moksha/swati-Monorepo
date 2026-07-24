import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill, KpiCard, Card } from "@/components/ui-primitives";
import { useAdminGeneric } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/publishers")({
  component: Page,
});

function Page() {
  const { data, isLoading } = useAdminGeneric("publishers");
  const items = data?.data ?? [];

  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Publishers" description="Partner and imprint records." actions={<Btn>New</Btn>} />
      <div className="flex flex-wrap gap-2 mb-6">
        <input placeholder="Search…" className="border border-rule bg-paper rounded px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select className="border border-rule bg-paper rounded px-3 py-2 text-sm"><option>All statuses</option><option>Active</option><option>Draft</option><option>Archived</option></select>
        <Btn variant="outline">Export CSV</Btn>
      </div>
      <div className="bg-paper border border-rule rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>{["Name","Status","Owner","Updated",""].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No records found</td></tr>
            ) : items.map((row: any) => (
              <tr key={row.id} className="border-t border-rule/50 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{row.name || 'publishers record #' + row.id}</td>
                <td className="px-4 py-3"><StatusPill status={row.status || 'Active'} /></td>
                <td className="px-4 py-3 text-muted-foreground">{row.owner || 'System'}</td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-right"><Btn size="sm" variant="outline">Edit</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
          <span>Showing {items.length} of {data?.meta?.total ?? items.length}</span>
          <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
        </div>
      </div>
    </AdminShell>
  );
}
