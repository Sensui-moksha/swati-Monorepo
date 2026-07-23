import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useLatestArticles } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/latest")({
  component: LatestPage,
});

function LatestPage() {
  const { data, isLoading } = useLatestArticles();
  const articles = data?.data ?? [];

  return (
    <PublicPage eyebrow="Latest" title="Latest Articles" description="The most recent stories from across all sections.">
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse h-16 bg-secondary rounded" />)}</div>
      ) : (
        <ul className="divide-y divide-rule">
          {articles.map((a) => (
            <li key={a.id} className="py-4">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="group flex gap-6">
                <div className="w-24 h-16 shrink-0 overflow-hidden rounded-sm bg-secondary"><img src={a.coverImage ?? ''} alt="" className="w-full h-full object-cover" /></div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.category?.name ?? 'Article'}</div>
                  <div className="font-serif text-lg group-hover:text-primary leading-snug">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.publishedAt ? formatShortDate(a.publishedAt) : ''} · {a.readingTime} min read</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PublicPage>
  );
}
