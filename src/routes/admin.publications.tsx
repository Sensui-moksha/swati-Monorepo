import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/publications")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="publications"
      title="Publications"
      description="Manage serial publications and periodicals."
    />
  );
}
