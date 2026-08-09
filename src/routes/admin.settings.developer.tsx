import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/developer")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell
        title="Developer"
        description="Debug modes, API mock toggles, and developer metrics."
      >
        <SettingsCategoryForm
          category="developer"
          title="Developer"
          description="Debug modes, API mock toggles, and developer metrics."
        />
      </SettingsShell>
    </AdminShell>
  );
}
