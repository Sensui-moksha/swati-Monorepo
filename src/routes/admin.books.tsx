import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/books")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="books"
      title="Books"
      description="Manage the full book catalogue."
    />
  );
}
