import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useArticles, useCategories } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/articles")({
  head: () => ({ meta: [{ title: "Publications — Swathi Publications" }, { name: "description", content: "All articles, essays, and reporting from Swathi Publications." }] }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { data: articlesData, isLoading } = useArticles();
  const { data: categoriesData } = useCategories();
  const articles = articlesData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <Crumbs items={[["Home", "/"], ["Publications", "/articles"]]} />
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">All Publications</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Every article, essay, and dispatch — filter by section or search the archive.</p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link to="/articles" className="border border-primary text-primary px-3 py-1 text-xs uppercase tracking-wider">All</Link>
          {categories.map((c) => (
            <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="border border-input px-3 py-1 text-xs uppercase tracking-wider hover:border-primary hover:text-primary">
              {c.name}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse"><div className="aspect-[4/3] bg-secondary" /><div className="mt-3 h-4 bg-secondary rounded w-1/3" /><div className="mt-2 h-6 bg-secondary rounded w-2/3" /></div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {articles.map((a) => (
              <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="group">
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={a.coverImage ?? ''} alt={a.title} className="h-full w-full object-cover" />
                </div>
                <div className="mt-3 eyebrow">{a.category?.name ?? 'Article'}</div>
                <h3 className="mt-1 font-serif text-xl leading-snug group-hover:text-primary">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                <div className="mt-2 text-xs text-muted-foreground">By {a.author?.name ?? 'Staff'} · {a.publishedAt ? formatShortDate(a.publishedAt) : ''}</div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-14 flex items-center justify-center gap-1 text-sm">
          <button className="border border-input px-3 py-2 hover:border-primary">‹ Prev</button>
          {[1,2,3,4,5].map((p) => (
            <button key={p} className={`w-9 h-9 border ${p===1 ? "border-primary text-primary" : "border-input hover:border-primary"}`}>{p}</button>
          ))}
          <button className="border border-input px-3 py-2 hover:border-primary">Next ›</button>
        </div>
      </div>
    </SiteLayout>
  );
}

export function Crumbs({ items }: { items: [string, string][] }) {
  return (
    <nav className="text-xs uppercase tracking-widest text-muted-foreground">
      {items.map(([label, href], i) => (
        <span key={href}>
          {i > 0 && <span className="mx-2">/</span>}
          {i === items.length - 1 ? (
            <span className="text-foreground">{label}</span>
          ) : (
            <Link to={href} className="hover:text-primary">{label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
