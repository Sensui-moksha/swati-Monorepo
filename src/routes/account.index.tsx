import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, KpiCard, Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/account/")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Account" title="Profile" description="Your account overview and quick settings." actions={<Btn variant="outline">Edit profile</Btn>} />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Books read" value="24" />
        <KpiCard label="Highlights" value="146" />
        <KpiCard label="Subscription" value="Digital+" />
      </div>
      <Card title="Personal information">
        <dl className="grid md:grid-cols-2 gap-4 text-sm">
          {[["Name","Ravi Iyer"],["Email","ravi@example.com"],["Member since","March 2023"],["Location","Chennai, India"]].map(([k,v])=>(
            <div key={k}><dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt><dd className="font-serif text-lg">{v}</dd></div>
          ))}
        </dl>
      </Card>
    </DashboardShell>
  ),
});
