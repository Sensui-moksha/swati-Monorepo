import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/notifications")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell
        title="Notifications"
        description="System email alerts, push notifications, and digests."
      >
        <SettingsCategoryForm
          category="notifications"
          title="Notifications"
          description="System email alerts, push notifications, and digests."
        />
      </SettingsShell>
    </AdminShell>
  );
}
