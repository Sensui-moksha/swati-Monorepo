import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useLatestArticles } from "@/lib/api/hooks";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News — Swathi Publications" }] }),
  component: NewsPage,
});

function NewsPage() {
  const { data, isLoading } = useLatestArticles({ limit: 8 });
  const articles = data?.data ?? [];

  return (
    <PublicPage eyebrow="Newsroom" title="News" description="Announcements, publication schedules, and updates from the house.">
      {isLoading ? (
        <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse h-20 bg-secondary rounded" />)}</div>
      ) : (
        <div className="space-y-6">
          {articles.map((a) => (
            <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="block border-b border-rule pb-6 hover:text-primary">
              <div className="text-xs uppercase tracking-widest text-primary">{a.category?.name ?? 'News'} · {a.publishedAt ? formatDate(a.publishedAt) : ''}</div>
              <div className="font-serif text-2xl mt-2">{a.title}</div>
              <div className="text-sm text-muted-foreground mt-2">{a.excerpt}</div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
