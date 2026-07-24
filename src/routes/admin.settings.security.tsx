import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { Card, Btn } from "@/components/ui-primitives";
import { useSettings } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/settings/security")({
  component: SettingsPage,
});

function SettingsPage() {
  const category = "security";
  const { data, isLoading } = useSettings(category);
  const fields = data?.data?.fields || ["Field label","Second field","Third field"];

  return (
    <AdminShell>
      <SettingsShell title="Security" description="Password rules, 2FA and access controls.">
        <div className="grid gap-6">
          <Card title="Security">
            {isLoading ? (
               <div className="p-4 space-y-4 animate-pulse">
                 <div className="h-12 bg-secondary/50 rounded w-full" />
                 <div className="h-12 bg-secondary/50 rounded w-full" />
                 <div className="h-12 bg-secondary/50 rounded w-full" />
               </div>
            ) : (
            <div className="space-y-4">
              {fields.map((f: any)=>(
                <label key={f.id || f} className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">{f.label || f}</span><input className="mt-1 w-full border border-rule bg-paper rounded px-3 py-2 text-sm" placeholder="Sample value" defaultValue={f.value || ""} /></label>
              ))}
              <div className="flex gap-2 pt-2"><Btn>Save changes</Btn><Btn variant="outline">Discard</Btn></div>
            </div>
            )}
          </Card>
        </div>
      </SettingsShell>
    </AdminShell>
  );
}
