import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader } from "@/components/ui-primitives";
import { useNotifications } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const notifications = data?.data ?? [];

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Notifications"
        description="Updates, alerts, and messages."
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-rule">
          {notifications.map((n: any) => (
            <li key={n.id} className="py-4">
              <div className="font-medium text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{n.message}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {n.createdAt ? formatShortDate(n.createdAt) : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
