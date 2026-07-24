import { createFileRoute } from "@tanstack/react-router";
import { useArticles } from "@/lib/api/hooks";
import { articlesApi } from "@/lib/api/endpoints/articles";
import { formatShortDate } from "@/lib/utils";
import { Card, StatusBadge } from "./admin.index";
import { Btn, Input, Label } from "@/components/ui-primitives";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Article } from "@/lib/api/types";

export const Route = createFileRoute("/admin/articles")({
  component: AdminArticlesPage,
});

function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useArticles();
  const articles = data?.data ?? [];

  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const createArticleMutation = useMutation({
    mutationFn: (article: Partial<Article>) => articlesApi.create(article),
    onSuccess: () => {
      toast.success("Article created successfully");
      setIsCreating(false);
      setEditingArticle(null);
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to create article"),
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Article> }) => articlesApi.update(id, data),
    onSuccess: () => {
      toast.success("Article updated successfully");
      setEditingArticle(null);
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to update article"),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => articlesApi.delete(id),
    onSuccess: () => {
      toast.success("Article deleted");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: () => toast.error("Failed to delete article"),
  });

  const handleOpenCreate = () => {
    setEditingArticle({
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title) {
      toast.error("Article title is required");
      return;
    }

    if (editingArticle.id) {
      updateArticleMutation.mutate({ id: editingArticle.id, data: editingArticle });
    } else {
      createArticleMutation.mutate({
        ...editingArticle,
        slug: editingArticle.slug || editingArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      });
    }
  };

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Articles</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? articles.length} articles in library</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles…"
              className="border border-input pl-9 pr-3 py-1.5 text-sm rounded-md focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> New article
          </button>
        </div>
      </div>

      {/* Article Edit / Create Form */}
      {editingArticle && (
        <Card title={isCreating ? "Create New Article" : `Edit Article: ${editingArticle.title}`}>
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                value={editingArticle.title || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                placeholder="Article title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={editingArticle.excerpt || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                placeholder="Brief summary..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                rows={5}
                value={editingArticle.content || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                placeholder="Write article content here..."
                className="w-full border border-rule bg-paper rounded p-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editingArticle.status || "draft"}
                onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as any })}
                className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Btn type="submit" disabled={createArticleMutation.isPending || updateArticleMutation.isPending}>
                {createArticleMutation.isPending || updateArticleMutation.isPending ? "Saving..." : "Save Article"}
              </Btn>
              <Btn type="button" variant="outline" onClick={() => setEditingArticle(null)}>
                Cancel
              </Btn>
            </div>
          </form>
        </Card>
      )}

      <Card title="All articles">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-secondary rounded animate-pulse" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-rule">
                <th className="text-left py-2">Title</th>
                <th className="text-left">Category</th>
                <th className="text-left">Status</th>
                <th className="text-right">Views</th>
                <th className="text-left">Published</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((a) => (
                <tr key={a.id} className="border-b border-rule/60 hover:bg-secondary/30">
                  <td className="py-3 max-w-md truncate font-medium">{a.title}</td>
                  <td>{a.category?.name ?? '—'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right">{a.viewCount?.toLocaleString() ?? 0}</td>
                  <td className="text-muted-foreground text-xs">{a.publishedAt ? formatShortDate(a.publishedAt) : '—'}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(a)} className="text-primary text-xs hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete article "${a.title}"?`)) {
                            deleteArticleMutation.mutate(a.id);
                          }
                        }}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
