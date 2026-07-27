import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill, Card, Input, Label } from "@/components/ui-primitives";
import { useAdminNotifications, useCreateAdminEntity } from "@/lib/api/hooks";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const { data, isLoading } = useAdminNotifications();
  const createNotification = useCreateAdminEntity("notifications");
  const notifications = data?.data ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("System Announcement");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please provide title and message");
      return;
    }
    createNotification.mutate(
      { type, title, message, status: "Delivered", date: new Date().toISOString() },
      {
        onSuccess: () => {
          toast.success(`Broadcasting notification: "${title}"`);
          setTitle("");
          setMessage("");
          setShowCreate(false);
        },
        onError: () => toast.error("Failed to broadcast notification"),
      }
    );
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin"
        title="Notifications"
        description="System and workflow notifications."
        actions={<Btn onClick={() => setShowCreate(!showCreate)}>+ New Notification</Btn>}
      />

      {showCreate && (
        <div className="mb-6">
          <Card title="Broadcast System Notification">
            <form onSubmit={handleSend} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="notifType">Notification Type</Label>
                <select
                  id="notifType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
                >
                  <option value="System Announcement">System Announcement</option>
                  <option value="Content Release">Content Release</option>
                  <option value="Maintenance Alert">Maintenance Alert</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message Body</Label>
                <textarea
                  id="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message body..."
                  className="w-full border border-rule bg-paper rounded p-3 text-sm"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Btn type="submit">Send Notification</Btn>
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
          <option>Unread</option>
          <option>Read</option>
        </select>
        <Btn variant="outline" onClick={() => toast.success("Exported notifications CSV")}>Export CSV</Btn>
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
                <tr>{["Type","Title","Message","Date","Status","Actions"].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No notifications found</td></tr>
                ) : (
                  notifications.map((n: any) => (
                    <tr key={n.id} className="border-t border-rule/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 text-muted-foreground capitalize">{n.type || "System"}</td>
                      <td className="px-4 py-3 font-medium">{n.title}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{n.message}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {n.createdAt || n.date ? new Date(n.createdAt || n.date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3"><StatusPill status={n.isRead ? "Read" : "Delivered"} /></td>
                      <td className="px-4 py-3 text-right">
                        <Btn size="sm" variant="outline" onClick={() => toast.info(`Notification Details: ${n.title}`)}>
                          View
                        </Btn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>Showing {notifications.length} of {data?.meta?.total ?? notifications.length}</span>
              <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
