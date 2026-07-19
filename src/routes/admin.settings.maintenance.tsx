import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { Card, Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/admin/settings/maintenance")({
  component: () => (
    <AdminShell>
      <SettingsShell title="Maintenance" description="Maintenance windows and mode.">
        <div className="grid gap-6">
          <Card title="Maintenance">
            <div className="space-y-4">
              {["Field label","Second field","Third field"].map((f)=>(
                <label key={f} className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">{f}</span><input className="mt-1 w-full border border-rule bg-paper rounded px-3 py-2 text-sm" placeholder="Sample value" /></label>
              ))}
              <div className="flex gap-2 pt-2"><Btn>Save changes</Btn><Btn variant="outline">Discard</Btn></div>
            </div>
          </Card>
        </div>
      </SettingsShell>
    </AdminShell>
  ),
});
