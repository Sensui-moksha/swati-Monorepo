import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/general")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="General" description="Platform-wide identifiers and defaults.">
        <SettingsCategoryForm
          category="general"
          title="General"
          description="Platform-wide identifiers and defaults."
        />
      </SettingsShell>
    </AdminShell>
  );
}
