import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { Card, Btn } from "@/components/ui-primitives";
import { useSettings, useUpdateSettings } from "@/lib/api/hooks";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/general")({
  component: SettingsPage,
});

function SettingsPage() {
  const category = "general";
  const { data, isLoading } = useSettings(category);
  const updateSettings = useUpdateSettings();
  const fields = data?.data?.fields || [
    { id: "1", label: "Site Name", value: "Swathi Publications" },
    { id: "2", label: "Support Email", value: "support@swathi.com" },
    { id: "3", label: "Default Currency", value: "INR" },
  ];

  const [formState, setFormState] = useState<Record<string, string>>({});

  const handleSave = () => {
    const updatedFields = fields.map((f: any) => ({
      ...f,
      value: formState[f.id] !== undefined ? formState[f.id] : f.value,
    }));

    updateSettings.mutate(
      { category, data: { category, fields: updatedFields } },
      {
        onSuccess: () => toast.success("Settings saved successfully"),
        onError: () => toast.error("Failed to save settings"),
      }
    );
  };

  return (
    <AdminShell>
      <SettingsShell title="General" description="Platform-wide identifiers and defaults.">
        <div className="grid gap-6">
          <Card title="General Settings">
            {isLoading ? (
               <div className="p-4 space-y-4 animate-pulse">
                 <div className="h-12 bg-secondary/50 rounded w-full" />
                 <div className="h-12 bg-secondary/50 rounded w-full" />
                 <div className="h-12 bg-secondary/50 rounded w-full" />
               </div>
            ) : (
            <div className="space-y-4">
              {fields.map((f: any)=>(
                <label key={f.id || f.label || f} className="block">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{f.label || f}</span>
                  <input 
                    className="mt-1 w-full border border-rule bg-paper rounded px-3 py-2 text-sm" 
                    placeholder="Enter value" 
                    defaultValue={f.value || ""} 
                    onChange={(e) => setFormState(prev => ({ ...prev, [f.id]: e.target.value }))}
                  />
                </label>
              ))}
              <div className="flex gap-2 pt-2">
                <Btn onClick={handleSave} disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? "Saving..." : "Save changes"}
                </Btn>
                <Btn variant="outline" onClick={() => setFormState({})}>Discard</Btn>
              </div>
            </div>
            )}
          </Card>
        </div>
      </SettingsShell>
    </AdminShell>
  );
}
