import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/localization")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Localization" description="Timezone, date formats, and regional preferences.">
        <SettingsCategoryForm category="localization" title="Localization" description="Timezone, date formats, and regional preferences." />
      </SettingsShell>
    </AdminShell>
  );
}
