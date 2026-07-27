import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/system-info")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="System Info" description="Runtime versions, server OS, and platform metrics.">
        <SettingsCategoryForm category="system-info" title="System Info" description="Runtime versions, server OS, and platform metrics." />
      </SettingsShell>
    </AdminShell>
  );
}
