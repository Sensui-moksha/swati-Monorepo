import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/account/orders")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Account" title="Order History" description="Past orders and invoices." />
      <Card><div className="text-sm text-muted-foreground">This section is part of the visual prototype. Interactions are illustrative.</div></Card>
    </DashboardShell>
  ),
});
