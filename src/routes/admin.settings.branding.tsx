import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/branding")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="Branding" description="Logo, colors and visual identity.">
        <SettingsCategoryForm
          category="branding"
          title="Branding"
          description="Logo, colors and visual identity."
        />
      </SettingsShell>
    </AdminShell>
  );
}
