import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill } from "@/components/ui-primitives";
import { usePublications } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/archive")({
  component: AdminArchivePage,
});

function AdminArchivePage() {
  const { data, isLoading } = usePublications({ status: 'archived' });
  const archive = data?.data ?? [];

  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Archive" description="Retired or paused publications." actions={<Btn>New</Btn>} />
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
                <tr>{["Name","Type","Publisher","Updated",""].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
              </thead>
              <tbody>
                {archive.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No archived items found</td></tr>
                ) : (
                  archive.map((a: any) => (
                    <tr key={a.id} className="border-t border-rule/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{a.title}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{a.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.publisher?.name || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right"><Btn size="sm" variant="outline">Restore</Btn></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>Showing {archive.length} of {data?.meta?.total ?? archive.length}</span>
              <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
