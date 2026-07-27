import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/maintenance")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Maintenance" description="System maintenance state, notices, and access bypass.">
        <SettingsCategoryForm category="maintenance" title="Maintenance" description="System maintenance state, notices, and access bypass." />
      </SettingsShell>
    </AdminShell>
  );
}
