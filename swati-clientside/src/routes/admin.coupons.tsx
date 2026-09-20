import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/coupons")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="coupons"
      title="Coupons"
      description="Manage promotional discount codes."
    />
  );
}
