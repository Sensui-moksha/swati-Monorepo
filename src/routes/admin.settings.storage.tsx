import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/storage")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Storage" description="File upload providers, S3 settings, and size limits.">
        <SettingsCategoryForm category="storage" title="Storage" description="File upload providers, S3 settings, and size limits." />
      </SettingsShell>
    </AdminShell>
  );
}
