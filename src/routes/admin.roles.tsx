import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill } from "@/components/ui-primitives";
import { useRoles } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/roles")({
  component: AdminRolesPage,
});

function AdminRolesPage() {
  const { data, isLoading } = useRoles();
  const roles = data?.data ?? [];

  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Roles & Permissions" description="Role definitions and access grants." actions={<Btn>New</Btn>} />
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
                <tr>{["Name","Status","Owner","Updated",""].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No roles found</td></tr>
                ) : (
                  roles.map((r: any) => (
                    <tr key={r.id || r.name} className="border-t border-rule/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3"><StatusPill status={r.status || "Active"} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.owner || "System"}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right"><Btn size="sm" variant="outline">Edit</Btn></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>Showing {roles.length} of {data?.meta?.total ?? roles.length}</span>
              <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
