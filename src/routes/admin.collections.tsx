import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/collections")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="collections"
      title="Collections"
      description="Manage curated reading bundles and lists."
    />
  );
}
