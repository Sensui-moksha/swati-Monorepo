import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/drafts")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="drafts"
      title="Drafts"
      description="Manage unpublished draft content and articles."
    />
  );
}
