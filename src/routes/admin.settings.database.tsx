import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/database")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Database" description="Database status, connection pool, and auto-indexes.">
        <SettingsCategoryForm category="database" title="Database" description="Database status, connection pool, and auto-indexes." />
      </SettingsShell>
    </AdminShell>
  );
}
