import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader } from "@/components/ui-primitives";
export const Route = createFileRoute("/dashboard/activity")({
  component: () => (
    <DashboardShell>
      <PageHeader
        eyebrow="Recent"
        title="Activity"
        description="A running log of what you've read, saved, and highlighted."
      />
      <ul className="border border-rule rounded divide-y divide-rule bg-paper">
        {[
          ["Read", "Advanced Mathematics — page 42", "2 hours ago"],
          ["Bookmarked", "Indian Polity — page 18", "Yesterday"],
          ["Highlighted", "Modern Physics — chapter 3", "2 days ago"],
          ["Finished", "General English Grammar", "3 days ago"],
          ["Subscribed", "Digital + Print plan", "1 week ago"],
          ["Downloaded", "Swathi Weekly #100", "1 week ago"],
        ].map(([action, target, when], i) => (
          <li key={i} className="p-4 flex justify-between text-sm">
            <span>
              <strong className="text-primary uppercase text-xs tracking-widest">{action}</strong> ·{" "}
              {target}
            </span>
            <span className="text-muted-foreground">{when}</span>
          </li>
        ))}
      </ul>
    </DashboardShell>
  ),
});
