import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { SectionTitle } from "@/components/ui-primitives";
import { useTrendingArticles } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/trending")({
  component: TrendingPage,
});

function TrendingPage() {
  const { data, isLoading } = useTrendingArticles({ period: "week" });
  const articles = data?.data ?? [];

  return (
    <PublicPage eyebrow="Discover" title="Trending" description="The most-read stories across all sections this week.">
      <SectionTitle eyebrow="Popular" title="Most Read This Week" />
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse h-16 bg-secondary rounded" />)}</div>
      ) : (
        <ul className="divide-y divide-rule">
          {articles.map((a, i) => (
            <li key={a.id} className="py-4">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="group flex gap-4">
                <span className="font-serif text-3xl text-primary/70 leading-none w-6 shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{a.category?.name ?? 'Article'}</div>
                  <h3 className="mt-1 font-serif text-lg leading-snug group-hover:text-primary">{a.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">{a.publishedAt ? formatShortDate(a.publishedAt) : ''} · {a.readingTime} min read</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PublicPage>
  );
}
