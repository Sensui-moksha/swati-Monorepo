import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/trending-mgmt")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="trending"
      title="Trending Management"
      description="Manage trending items and topic curation."
    />
  );
}
