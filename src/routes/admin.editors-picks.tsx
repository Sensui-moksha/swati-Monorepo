import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/editors-picks")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="editors-picks"
      title="Editor's Picks"
      description="Manage hand-picked editorial recommendations."
    />
  );
}
