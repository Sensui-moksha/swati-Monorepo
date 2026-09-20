import { createFileRoute } from "@tanstack/react-router";
import { useAdminComments } from "@/lib/api/hooks";
import { Card, StatusBadge } from "./admin.index";

export const Route = createFileRoute("/admin/comments")({
  component: AdminCommentsPage,
});

function AdminCommentsPage() {
  const { data, isLoading } = useAdminComments();
  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Comments</h1>
        <p className="text-sm text-muted-foreground">Reader comments across all articles</p>
      </div>
      <Card title="Recent comments">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No comments to display
          </div>
        ) : (
          <ul className="divide-y divide-rule text-sm">
            {items.map((a) => (
              <li key={a.id} className="py-3">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.excerpt}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
