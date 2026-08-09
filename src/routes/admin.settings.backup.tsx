import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/backup")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell
        title="Backup & Restore"
        description="Automated snapshot schedule and backup archives."
      >
        <SettingsCategoryForm
          category="backup"
          title="Backup & Restore"
          description="Automated snapshot schedule and backup archives."
        />
      </SettingsShell>
    </AdminShell>
  );
}
