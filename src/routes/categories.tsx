import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useCategories } from "@/lib/api/hooks";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Swathi Publications" },
      { name: "description", content: "Browse all editorial sections." },
    ],
  }),
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
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Every editorial section, from breaking news to long-form culture.
        </p>

        {isLoading ? (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-paper border border-rule rounded-md p-8 animate-pulse">
                <div className="h-8 bg-secondary rounded w-1/3" />
                <div className="h-4 bg-secondary rounded w-2/3 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="bg-paper border border-rule rounded-md p-8 hover:border-primary transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-2xl md:text-3xl font-semibold group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium shrink-0">
                      {c.articleCount} articles
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {c.description ||
                      "Explore editorial articles, opinion pieces, and feature stories."}
                  </p>
                </div>
                <div className="mt-6 text-xs uppercase tracking-widest font-semibold text-primary">
                  View Section →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
