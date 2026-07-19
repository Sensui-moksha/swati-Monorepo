import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { TRENDING, formatShortDate } from "@/lib/mock-data";
import { TrendingUp, Eye } from "lucide-react";

export const Route = createFileRoute("/trending")({
  head: () => ({ meta: [{ title: "Trending — Swathi Publications" }, { name: "description", content: "The most-read stories right now." }] }),
  component: () => (
    <SiteLayout>
      <div className="container-edit py-12">
        <div className="eyebrow flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> This week</div>
        <h1 className="mt-2 font-serif text-5xl">Trending</h1>
        <p className="mt-2 text-muted-foreground">Stories our readers are talking about.</p>

        <ol className="mt-10 space-y-8">
          {TRENDING.map((a, i) => (
            <li key={a.id}>
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[48px_minmax(0,1fr)] sm:grid-cols-[80px_180px_minmax(0,1fr)] gap-6 items-start rule-bottom pb-8">
                <span className="font-serif text-5xl text-primary/70 leading-none">{i + 1}</span>
                <img src={a.image} alt={a.title} className="hidden sm:block aspect-[4/3] w-full object-cover bg-secondary" />
                <div>
                  <div className="eyebrow">{a.categoryName}</div>
                  <h3 className="mt-1 font-serif text-2xl group-hover:text-primary">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
                    <span>{formatShortDate(a.date)}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.views.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </SiteLayout>
  ),
});
