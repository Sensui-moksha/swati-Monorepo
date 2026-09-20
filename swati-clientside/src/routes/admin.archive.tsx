import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/archive")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="archive"
      title="Archive"
      description="Manage archived historical records and editions."
    />
  );
}
