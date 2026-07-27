import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/news")({
  component: Page,
});

function Page() {
  return (
    <AdminEntityPage
      entity="news"
      title="News"
      description="Manage news releases and press announcements."
    />
  );
}
