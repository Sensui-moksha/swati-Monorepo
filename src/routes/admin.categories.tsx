import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  return (
    <AdminEntityPage
      entity="categories"
      title="Categories"
      description="Top-level taxonomies for the catalogue."
    />
  );
}
