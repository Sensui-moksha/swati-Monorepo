import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/roles")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="roles"
      title="Roles & Permissions"
      description="Manage role definitions and access control policies."
    />
  );
}
