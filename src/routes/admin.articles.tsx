import { createFileRoute } from "@tanstack/react-router";
import { useArticles } from "@/lib/api/hooks";
import { articlesApi } from "@/lib/api/endpoints/articles";
import { formatShortDate } from "@/lib/utils";
import { Card, StatusBadge } from "./admin.index";
import { Btn, Input, Label } from "@/components/ui-primitives";
import { Plus, Search, FileText } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Article } from "@/lib/api/types";

const PdfBookViewer = lazy(() => import("@/components/PdfBookViewer").then(m => ({ default: m.PdfBookViewer })));

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
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [selectedBookPdf, setSelectedBookPdf] = useState<{ title: string; pdfUrl?: string } | null>(null);

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
      content: "PDF Document",
      pdfUrl: "",
      status: "published",
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
        <Card title={isCreating ? "Upload New PDF Article" : `Edit Article PDF: ${editingArticle.title}`}>
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
              <Label htmlFor="pdfUrl">PDF File URL / Upload Path</Label>
              <Input
                id="pdfUrl"
                value={editingArticle.pdfUrl || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, pdfUrl: e.target.value })}
                placeholder="e.g. /documents/issue-104.pdf or https://..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Articles are published directly as uploaded PDF documents.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt / Summary</Label>
              <Input
                id="excerpt"
                value={editingArticle.excerpt || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                placeholder="Brief summary..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editingArticle.status || "published"}
                onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as any })}
                className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Btn type="submit" disabled={createArticleMutation.isPending || updateArticleMutation.isPending}>
                {createArticleMutation.isPending || updateArticleMutation.isPending ? "Saving..." : "Save PDF Article"}
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
          <table className="w-full text-sm border-collapse">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-secondary/40 border-b border-rule">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Views</th>
                <th className="text-left px-4 py-3 font-semibold">Published</th>
                <th className="text-left px-4 py-3 font-semibold">PDF File</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((a) => (
                <tr key={a.id} className="border-b border-rule/60 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs truncate font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.category?.name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-right tabular-nums">{a.viewCount?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{a.publishedAt ? formatShortDate(a.publishedAt) : '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    <button
                      onClick={() =>
                        setSelectedBookPdf({
                          title: a.title,
                          pdfUrl: a.pdfUrl || "/documents/sample-issue.pdf",
                        })
                      }
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium bg-primary/10 px-2 py-1 rounded"
                    >
                      <FileText className="h-3.5 w-3.5" /> Book View
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(a)} className="text-primary text-xs font-medium hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => setArticleToDelete(a)}
                        className="text-red-600 text-xs font-medium hover:underline"
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
        {articleToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-paper border border-rule rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-rule pb-3">
                <h3 className="font-serif text-lg font-semibold text-destructive">Confirm Deletion</h3>
                <button
                  type="button"
                  onClick={() => setArticleToDelete(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-foreground">
                Are you sure you want to delete <span className="font-semibold">{articleToDelete.title}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <Btn variant="outline" onClick={() => setArticleToDelete(null)}>
                  Cancel
                </Btn>
                <Btn
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    deleteArticleMutation.mutate(articleToDelete.id, {
                      onSuccess: () => setArticleToDelete(null),
                      onError: () => setArticleToDelete(null),
                    });
                  }}
                  disabled={deleteArticleMutation.isPending}
                >
                  {deleteArticleMutation.isPending ? "Deleting..." : "Delete"}
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* In-App Book View Flipbook Reader Modal */}
        {selectedBookPdf && (
          <Suspense fallback={null}>
            <PdfBookViewer
              isOpen={!!selectedBookPdf}
              title={selectedBookPdf.title}
              pdfUrl={selectedBookPdf.pdfUrl}
              onClose={() => setSelectedBookPdf(null)}
            />
          </Suspense>
        )}
      </Card>
    </div>
  );
}
