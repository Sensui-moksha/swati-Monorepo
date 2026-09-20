import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/staff")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="staff"
      title="Staff"
      description="Manage administrative staff accounts and roles."
    />
  );
}
