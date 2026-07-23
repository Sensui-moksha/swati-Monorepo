import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useCategories } from "@/lib/api/hooks";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Swathi Publications" }, { name: "description", content: "Browse all editorial sections." }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const categories = data?.data ?? [];

  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <div className="eyebrow">Sections</div>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">All Categories</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Every editorial section, from breaking news to long-form culture.</p>

        {isLoading ? (
          <div className="mt-10 grid md:grid-cols-2 gap-px bg-rule border border-rule">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-paper p-8 animate-pulse"><div className="h-8 bg-secondary rounded w-1/3" /><div className="h-4 bg-secondary rounded w-2/3 mt-2" /></div>)}
          </div>
        ) : (
          <div className="mt-10 grid md:grid-cols-2 gap-px bg-rule border border-rule">
            {categories.map((c) => (
              <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="bg-paper p-8 hover:bg-secondary transition-colors group">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-3xl group-hover:text-primary">{c.name}</h3>
                  <span className="text-xs text-muted-foreground">{c.articleCount} articles</span>
                </div>
                <p className="mt-2 text-muted-foreground">{c.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
