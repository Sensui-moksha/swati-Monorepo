import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/auth")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell
        title="Authentication"
        description="Sign-in methods and session security policies."
      >
        <SettingsCategoryForm
          category="auth"
          title="Authentication"
          description="Sign-in methods and session security policies."
        />
      </SettingsShell>
    </AdminShell>
  );
}
