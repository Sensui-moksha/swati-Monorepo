import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ARTICLES, formatShortDate } from "@/lib/mock-data";

export const Route = createFileRoute("/latest")({
  head: () => ({ meta: [{ title: "Latest Releases — Swathi Publications" }, { name: "description", content: "Fresh reporting, published daily." }] }),
  component: () => (
    <SiteLayout>
      <div className="container-edit py-12">
        <div className="eyebrow">Live</div>
        <h1 className="mt-2 font-serif text-5xl">Latest Releases</h1>
        <p className="mt-2 text-muted-foreground">Updated throughout the day.</p>
        <ul className="mt-10 divide-y divide-rule">
          {ARTICLES.map((a) => (
            <li key={a.id} className="py-6">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)] gap-6">
                <img src={a.image} alt={a.title} className="aspect-[4/3] w-full object-cover bg-secondary" />
                <div className="min-w-0">
                  <div className="eyebrow">{a.categoryName}</div>
                  <h3 className="mt-1 font-serif text-xl sm:text-2xl group-hover:text-primary">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
                  <div className="mt-2 text-xs text-muted-foreground">{formatShortDate(a.date)} · {a.readTime}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </SiteLayout>
  ),
});
