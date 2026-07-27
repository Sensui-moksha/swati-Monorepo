import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/integrations")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Integrations" description="Third-party services, analytics, and messaging bots.">
        <SettingsCategoryForm category="integrations" title="Integrations" description="Third-party services, analytics, and messaging bots." />
      </SettingsShell>
    </AdminShell>
  );
}
