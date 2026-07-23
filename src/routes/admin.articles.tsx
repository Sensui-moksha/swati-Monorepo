import { createFileRoute } from "@tanstack/react-router";
import { useArticles } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { Card, StatusBadge } from "./admin.index";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/admin/articles")({
  component: AdminArticlesPage,
});

function AdminArticlesPage() {
  const { data, isLoading } = useArticles();
  const articles = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Articles</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? articles.length} articles in library</p>
        </div>
        <div className="flex gap-2">
          <div className="relative"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="Search…" className="border border-input pl-9 pr-3 py-1.5 text-sm rounded-md focus:outline-none focus:border-primary" /></div>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md hover:bg-primary/90"><Plus className="h-4 w-4" /> New article</button>
        </div>
      </div>
      <Card title="All articles">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-secondary rounded animate-pulse" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-rule"><th className="text-left py-2">Title</th><th className="text-left">Category</th><th className="text-left">Status</th><th className="text-right">Views</th><th className="text-left">Published</th><th></th></tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-rule/60 hover:bg-secondary/30">
                  <td className="py-3 max-w-md truncate">{a.title}</td>
                  <td>{a.category?.name ?? '—'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right">{a.viewCount?.toLocaleString()}</td>
                  <td className="text-muted-foreground text-xs">{a.publishedAt ? formatShortDate(a.publishedAt) : '—'}</td>
                  <td className="text-right"><button className="text-primary text-xs hover:underline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
