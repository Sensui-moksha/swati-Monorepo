import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/campaigns")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="campaigns"
      title="Campaigns"
      description="Manage marketing and promotional campaigns."
    />
  );
}
