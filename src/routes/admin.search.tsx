import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, Input, StatusPill } from "@/components/ui-primitives";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useState } from "react";

export const Route = createFileRoute("/admin/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: AdminSearchPage,
});

function AdminSearchPage() {
  const { q } = useSearch({ from: "/admin/search" });
  const navigate = useNavigate();
  const [queryInput, setQueryInput] = useState(q || "");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["adminGlobalSearch", q],
    queryFn: async () => {
      if (!q) return { data: [] };
      const res: any = await apiClient.get("/v1/admin/search", { params: { q } });
      return res.data;
    },
    enabled: Boolean(q),
  });

  const results = data?.data ?? [];
  const filtered = results.filter(
    (item: any) => typeFilter === "all" || item.type?.toLowerCase() === typeFilter.toLowerCase(),
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      navigate({ to: "/admin/search", search: { q: queryInput.trim() } as any });
    }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin"
        title="Global Search"
        description="Search across users, articles, books, and publications."
      />

      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6 max-w-2xl">
        <Input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search by title, name, email, or keyword..."
          className="flex-1"
        />
        <Btn type="submit">Search</Btn>
      </form>

      <div className="flex items-center gap-2 mb-6">
        {["all", "user", "article", "book", "publication"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 text-xs rounded-full capitalize border transition-colors ${
              typeFilter === t
                ? "bg-primary text-primary-foreground border-primary"
                : "border-rule bg-paper hover:bg-secondary text-muted-foreground"
            }`}
          >
            {t === "all" ? "All Results" : `${t}s`}
          </button>
        ))}
      </div>

      <div className="bg-paper border border-rule rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {q ? `No records found matching "${q}"` : "Enter a search term above to begin search"}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground border-b border-rule">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Name / Title</th>
                <th className="px-4 py-3 font-medium">Identifier / Slug</th>
                <th className="px-4 py-3 font-medium">Status / Role</th>
                <th className="px-4 py-3 font-medium text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/50">
              {filtered.map((item: any) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-semibold uppercase text-primary">
                    {item.type}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.slug}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
