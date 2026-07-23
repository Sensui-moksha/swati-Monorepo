import { createFileRoute } from "@tanstack/react-router";
import { useArticles, useCategories } from "@/lib/api/hooks";
import { Card } from "./admin.index";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: catData } = useCategories();
  const { data: artData } = useArticles({ limit: 10 });
  const categories = catData?.data ?? [];
  const articles = artData?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">Content performance and audience insights</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Articles by category">
          <ul className="space-y-2 text-sm">{categories.map((c) => (
            <li key={c.id} className="flex justify-between"><span>{c.name}</span><span className="text-muted-foreground">{c.articleCount} articles</span></li>
          ))}</ul>
        </Card>
        <Card title="Top articles">
          <ul className="space-y-2 text-sm">{articles.map((a) => (
            <li key={a.id} className="flex justify-between gap-4"><span className="truncate">{a.title}</span><span className="text-muted-foreground shrink-0">{a.viewCount?.toLocaleString()} views</span></li>
          ))}</ul>
        </Card>
      </div>
    </div>
  );
}
