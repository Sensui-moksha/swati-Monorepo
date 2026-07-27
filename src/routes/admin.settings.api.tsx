import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/api")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell title="API & Webhooks" description="REST & GraphQL endpoint limits and webhook keys.">
        <SettingsCategoryForm category="api" title="API & Webhooks" description="REST & GraphQL endpoint limits and webhook keys." />
      </SettingsShell>
    </AdminShell>
  );
}
