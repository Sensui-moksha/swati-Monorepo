import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/tasks")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="tasks"
      title="Task Center"
      description="Manage editorial assignments and background tasks."
    />
  );
}
