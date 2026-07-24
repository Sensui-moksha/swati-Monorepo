import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill } from "@/components/ui-primitives";
import { useMedia } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/media")({
  component: AdminMediaPage,
});

function AdminMediaPage() {
  const { data, isLoading } = useMedia();
  const mediaAssets = data?.data ?? [];

  return (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Media Library" description="Images, covers, and downloadable assets." actions={<Btn>New</Btn>} />
      <div className="flex flex-wrap gap-2 mb-6">
        <input placeholder="Search…" className="border border-rule bg-paper rounded px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select className="border border-rule bg-paper rounded px-3 py-2 text-sm"><option>All types</option><option>Images</option><option>Documents</option><option>Audio</option></select>
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
                <tr>{["Preview","Name","Type","Size","Uploaded",""].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
              </thead>
              <tbody>
                {mediaAssets.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No media assets found</td></tr>
                ) : (
                  mediaAssets.map((m: any) => (
                    <tr key={m.id} className="border-t border-rule/50 hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        {m.thumbnailUrl || m.url ? (
                          <img src={m.thumbnailUrl || m.url} alt={m.filename} className="w-10 h-10 object-cover rounded bg-secondary" />
                        ) : (
                          <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-muted-foreground text-xs">{m.mimeType?.split('/')[1] || 'file'}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium truncate max-w-[200px]">{m.originalName || m.filename}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.mimeType}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {m.size ? (m.size / 1024 / 1024).toFixed(2) + ' MB' : '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right"><Btn size="sm" variant="outline">View</Btn></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>Showing {mediaAssets.length} of {data?.meta?.total ?? mediaAssets.length}</span>
              <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
