import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useCategoryBySlug, useArticles } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { Crumbs } from "./articles";

export const Route = createFileRoute("/categories/$slug")({
  head: () => ({ meta: [{ title: "Category — Swathi Publications" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: catData, isLoading: catLoading } = useCategoryBySlug(slug);
  const cat = catData?.data;

  // Primary fetch: category-specific articles
  const { data: articlesData, isLoading: artLoading } = useArticles({ categoryId: cat?.id } as any);
  // Fallback fetch: all articles if category has no specific articles
  const { data: allArticlesData } = useArticles();

  const specificArticles = articlesData?.data ?? [];
  const allArticles = allArticlesData?.data ?? [];
  const displayArticles = specificArticles.length > 0 ? specificArticles : allArticles;

  // Format category title dynamically if cat doc is not returned
  const catName = cat?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const catDesc = cat?.description || `Explore top editorial articles, features, and stories in ${catName}.`;

  if (catLoading && !catName) {
    return (
      <SiteLayout>
        <div className="container-edit py-12 animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/4 mb-4" />
          <div className="h-12 bg-secondary rounded w-1/2 mb-4" />
          <div className="h-4 bg-secondary rounded w-3/4" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <Crumbs items={[["Home", "/"], ["Categories", "/categories"], [catName, `/categories/${slug}`]]} />
        <div className="mt-4 eyebrow">Section</div>
        <h1 className="mt-2 font-serif text-5xl">{catName}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{catDesc}</p>

        <div className="mt-10 space-y-10">
          {artLoading && displayArticles.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse grid md:grid-cols-12 gap-6 pb-10">
                <div className="md:col-span-4 aspect-[4/3] bg-secondary" />
                <div className="md:col-span-8 space-y-3">
                  <div className="h-4 bg-secondary rounded w-1/4" />
                  <div className="h-8 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded" />
                </div>
              </div>
            ))
          ) : (
            displayArticles.map((a: any) => (
              <Link
                key={a.id || a._id}
                to="/articles/$slug"
                params={{ slug: a.slug || a.id }}
                className="group grid md:grid-cols-12 gap-6 rule-bottom pb-10 last:border-0"
              >
                <div className="md:col-span-4">
                  <img
                    src={a.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"}
                    alt={a.title}
                    className="aspect-[4/3] w-full object-cover bg-secondary rounded"
                  />
                </div>
                <div className="md:col-span-8">
                  <div className="eyebrow">
                    {a.category?.name || catName}{" "}
                    {a.isPremium && <span className="ml-2 text-primary">· Premium</span>}
                  </div>
                  <h3 className="mt-1 font-serif text-2xl md:text-3xl group-hover:text-primary transition-colors">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground line-clamp-3">{a.excerpt}</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    By {a.author?.name || "Editorial Staff"} · {a.publishedAt ? formatShortDate(a.publishedAt) : "Recently Published"} · {a.readingTime || 5} min read
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
