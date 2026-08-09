import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/audit")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell
        title="Audit & Logs"
        description="Administrative action logging and security trail."
      >
        <SettingsCategoryForm
          category="audit"
          title="Audit & Logs"
          description="Administrative action logging and security trail."
        />
      </SettingsShell>
    </AdminShell>
  );
}
