import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, StatusPill } from "@/components/ui-primitives";
import { NOTIFICATIONS } from "@/lib/mock-extended";
export const Route = createFileRoute("/dashboard/notifications")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Center" title="Notifications" description="Updates about your reading, subscription, and account." />
      <ul className="border border-rule rounded divide-y divide-rule bg-paper">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id} className={`p-4 flex justify-between gap-4 ${n.unread ? "bg-primary/5" : ""}`}>
            <div className="min-w-0"><div className="font-medium flex items-center gap-2">{n.title}{n.unread && <span className="w-2 h-2 rounded-full bg-primary" />}</div><div className="text-sm text-muted-foreground">{n.body}</div></div>
            <div className="text-xs text-muted-foreground shrink-0">{n.time}<div className="mt-1"><StatusPill status={n.type} /></div></div>
          </li>
        ))}
      </ul>
    </DashboardShell>
  ),
});
