import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/scheduled")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="scheduled"
      title="Scheduled Content"
      description="Manage upcoming scheduled publishing queues."
    />
  );
}
