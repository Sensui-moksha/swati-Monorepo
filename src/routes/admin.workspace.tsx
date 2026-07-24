import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill, Card, Input, Label } from "@/components/ui-primitives";
import { useWorkspace } from "@/lib/api/hooks";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/workspace")({
  component: AdminWorkspacePage,
});

function AdminWorkspacePage() {
  const { data, isLoading, refetch } = useWorkspace();
  const workspaces = data?.data ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState("Active");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    toast.success(`Created workspace task: "${newTitle}"`);
    setNewTitle("");
    setShowCreate(false);
    refetch();
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin"
        title="Workspace"
        description="Your active work across the platform."
        actions={<Btn onClick={() => setShowCreate(!showCreate)}>+ New Workspace Item</Btn>}
      />

      {showCreate && (
        <div className="mb-6">
          <Card title="Create New Workspace Item">
            <form onSubmit={handleCreate} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="title">Task / Work Name</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Review Editorial Proofs..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="In Review">In Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Btn type="submit">Create Item</Btn>
                <Btn type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Btn>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <input placeholder="Search…" className="border border-rule bg-paper rounded px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select className="border border-rule bg-paper rounded px-3 py-2 text-sm">
          <option>All statuses</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
        <Btn variant="outline" onClick={() => toast.success("Exported workspace CSV")}>Export CSV</Btn>
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
                <tr>{["Name","Status","Owner","Updated","Actions"].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
              </thead>
              <tbody>
                {workspaces.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No workspace records found</td></tr>
                ) : (
                  workspaces.map((w: any) => (
                    <tr key={w.id} className="border-t border-rule/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{w.name}</td>
                      <td className="px-4 py-3"><StatusPill status={w.status || "Active"} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{w.owner || "Editorial Team"}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Btn size="sm" variant="outline" onClick={() => toast.info(`Viewing workspace item: ${w.name}`)}>
                          View
                        </Btn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>Showing {workspaces.length} of {data?.meta?.total ?? workspaces.length}</span>
              <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
