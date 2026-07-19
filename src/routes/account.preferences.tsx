import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/account/preferences")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Account" title="Preferences" description="Reading, notification and display preferences." />
      <Card><div className="text-sm text-muted-foreground">This section is part of the visual prototype. Interactions are illustrative.</div></Card>
    </DashboardShell>
  ),
});
