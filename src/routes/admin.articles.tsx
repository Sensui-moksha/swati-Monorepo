import { createFileRoute } from "@tanstack/react-router";
import { ARTICLES, formatShortDate } from "@/lib/mock-data";
import { Card, StatusBadge } from "./admin.index";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/admin/articles")({
  component: () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Articles</h1>
          <p className="text-sm text-muted-foreground">{ARTICLES.length} articles in library</p>
        </div>
        <div className="flex gap-2">
          <div className="relative"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="Search…" className="border border-input pl-9 pr-3 py-1.5 text-sm rounded-md focus:outline-none focus:border-primary" /></div>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md hover:bg-primary/90"><Plus className="h-4 w-4" /> New article</button>
        </div>
      </div>
      <Card title="All articles">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-rule"><th className="text-left py-2">Title</th><th className="text-left">Section</th><th className="text-left">Author</th><th className="text-left">Access</th><th className="text-right">Views</th><th className="text-left">Published</th><th></th></tr>
          </thead>
          <tbody>
            {ARTICLES.map((a) => (
              <tr key={a.id} className="border-b border-rule/60 hover:bg-secondary/30">
                <td className="py-3 max-w-md truncate">{a.title}</td>
                <td>{a.categoryName}</td>
                <td className="text-muted-foreground">{a.author}</td>
                <td><StatusBadge status={a.premium ? "Premium" : "Free"} /></td>
                <td className="text-right">{a.views.toLocaleString()}</td>
                <td className="text-muted-foreground text-xs">{formatShortDate(a.date)}</td>
                <td className="text-right"><button className="text-primary text-xs hover:underline">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  ),
});
