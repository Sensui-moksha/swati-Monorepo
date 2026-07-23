import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useCategoryBySlug, useArticles } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { Crumbs } from "./articles";

export const Route = createFileRoute("/categories/$slug")({
  head: () => ({ meta: [{ title: "Category — Swathi Publications" }] }),
  notFoundComponent: () => (
    <SiteLayout><div className="container-edit py-24 text-center"><h1 className="font-serif text-4xl">Category not found</h1></div></SiteLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: catData, isLoading: catLoading } = useCategoryBySlug(slug);
  const cat = catData?.data;
  const { data: articlesData, isLoading: artLoading } = useArticles({ categoryId: cat?.id } as any);
  const articles = articlesData?.data ?? [];

  if (catLoading) {
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

  if (!cat) {
    return (
      <SiteLayout><div className="container-edit py-24 text-center"><h1 className="font-serif text-4xl">Category not found</h1></div></SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <Crumbs items={[["Home","/"],["Categories","/categories"],[cat.name, `/categories/${cat.slug}`]]} />
        <div className="mt-4 eyebrow">Section</div>
        <h1 className="mt-2 font-serif text-5xl">{cat.name}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{cat.description}</p>

        <div className="mt-10 space-y-10">
          {artLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse grid md:grid-cols-12 gap-6 pb-10"><div className="md:col-span-4 aspect-[4/3] bg-secondary" /><div className="md:col-span-8 space-y-3"><div className="h-4 bg-secondary rounded w-1/4" /><div className="h-8 bg-secondary rounded w-3/4" /><div className="h-4 bg-secondary rounded" /></div></div>)
          ) : articles.length === 0 ? (
            <p className="text-muted-foreground">No articles yet in this section.</p>
          ) : (
            articles.map((a) => (
              <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="group grid md:grid-cols-12 gap-6 rule-bottom pb-10 last:border-0">
                <div className="md:col-span-4">
                  <img src={a.coverImage ?? ''} alt={a.title} className="aspect-[4/3] w-full object-cover bg-secondary" />
                </div>
                <div className="md:col-span-8">
                  <div className="eyebrow">{cat.name} {(a as any).isPremium && <span className="ml-2 text-primary">· Premium</span>}</div>
                  <h3 className="mt-1 font-serif text-2xl md:text-3xl group-hover:text-primary">{a.title}</h3>
                  <p className="mt-3 text-muted-foreground">{a.excerpt}</p>
                  <div className="mt-3 text-xs text-muted-foreground">By {a.author?.name ?? 'Staff'} · {a.publishedAt ? formatShortDate(a.publishedAt) : ''} · {a.readingTime} min read</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
