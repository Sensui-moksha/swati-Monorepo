import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ARTICLES, CATEGORIES, formatShortDate } from "@/lib/mock-data";

export const Route = createFileRoute("/articles")({
  head: () => ({ meta: [{ title: "Publications — Swathi Publications" }, { name: "description", content: "All articles, essays, and reporting from Swathi Publications." }] }),
  component: ArticlesPage,
});

function ArticlesPage() {
  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <Crumbs items={[["Home", "/"], ["Publications", "/articles"]]} />
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">All Publications</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Every article, essay, and dispatch — filter by section or search the archive.</p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link to="/articles" className="border border-primary text-primary px-3 py-1 text-xs uppercase tracking-wider">All</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="border border-input px-3 py-1 text-xs uppercase tracking-wider hover:border-primary hover:text-primary">
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {ARTICLES.map((a) => (
            <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="group">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img src={a.image} alt={a.title} className="h-full w-full object-cover" />
              </div>
              <div className="mt-3 eyebrow">{a.categoryName}</div>
              <h3 className="mt-1 font-serif text-xl leading-snug group-hover:text-primary">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
              <div className="mt-2 text-xs text-muted-foreground">By {a.author} · {formatShortDate(a.date)}</div>
            </Link>
          ))}
        </div>

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
