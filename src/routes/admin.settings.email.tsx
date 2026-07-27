import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/email")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Email & SMTP" description="SMTP mail server configuration and sender options.">
        <SettingsCategoryForm category="email" title="Email & SMTP" description="SMTP mail server configuration and sender options." />
      </SettingsShell>
    </AdminShell>
  );
}
