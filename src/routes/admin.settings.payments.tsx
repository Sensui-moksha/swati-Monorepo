import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { SettingsCategoryForm } from "@/components/admin/SettingsCategoryForm";

export const Route = createFileRoute("/admin/settings/payments")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell>
      <SettingsShell
        title="Payments"
        description="Gateway credentials, tax rules, and commerce options."
      >
        <SettingsCategoryForm
          category="payments"
          title="Payments"
          description="Gateway credentials, tax rules, and commerce options."
        />
      </SettingsShell>
    </AdminShell>
  );
}
