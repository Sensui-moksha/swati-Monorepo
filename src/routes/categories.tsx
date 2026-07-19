import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ARTICLES, CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Swathi Publications" }, { name: "description", content: "Browse all editorial sections." }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <div className="eyebrow">Sections</div>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">All Categories</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Every editorial section, from breaking news to long-form culture.</p>

        <div className="mt-10 grid md:grid-cols-2 gap-px bg-rule border border-rule">
          {CATEGORIES.map((c) => {
            const count = ARTICLES.filter((a) => a.category === c.slug).length;
            return (
              <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="bg-paper p-8 hover:bg-secondary transition-colors group">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-3xl group-hover:text-primary">{c.name}</h3>
                  <span className="text-xs text-muted-foreground">{count} articles</span>
                </div>
                <p className="mt-2 text-muted-foreground">{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
