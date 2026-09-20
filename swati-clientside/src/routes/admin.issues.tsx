import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/issues")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="issues"
      title="Magazine Issues"
      description="Manage published and upcoming magazine issues."
    />
  );
}
