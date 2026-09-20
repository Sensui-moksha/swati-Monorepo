import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/series")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="series"
      title="Series"
      description="Manage multi-part book and story series."
    />
  );
}
