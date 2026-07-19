import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/account/subscription")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Account" title="Subscription" description="Manage your subscription plan and billing." />
      <Card><div className="text-sm text-muted-foreground">This section is part of the visual prototype. Interactions are illustrative.</div></Card>
    </DashboardShell>
  ),
});
