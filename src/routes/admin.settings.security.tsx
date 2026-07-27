import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/security")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Security" description="Password rules, 2FA, and network access controls.">
        <SettingsCategoryForm category="security" title="Security" description="Password rules, 2FA, and network access controls." />
      </SettingsShell>
    </AdminShell>
  );
}
