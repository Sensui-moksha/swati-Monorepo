import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/monitoring")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Monitoring" description="System health metrics, error reporting, and logs.">
        <SettingsCategoryForm category="monitoring" title="Monitoring" description="System health metrics, error reporting, and logs." />
      </SettingsShell>
    </AdminShell>
  );
}
