import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/featured")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="featured"
      title="Featured Content"
      description="Manage featured showcase items on home page."
    />
  );
}
