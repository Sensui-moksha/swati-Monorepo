import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { ARTICLES, formatDate } from "@/lib/mock-data";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News — Swathi Publications" }] }),
  component: () => (
    <PublicPage eyebrow="Newsroom" title="News" description="Announcements, publication schedules, and updates from the house.">
      <div className="space-y-6">
        {ARTICLES.slice(0, 8).map((a) => (
          <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="block border-b border-rule pb-6 hover:text-primary">
            <div className="text-xs uppercase tracking-widest text-primary">{a.categoryName} · {formatDate(a.date)}</div>
            <div className="font-serif text-2xl mt-2">{a.title}</div>
            <div className="text-sm text-muted-foreground mt-2">{a.subtitle}</div>
          </Link>
        ))}
      </div>
    </PublicPage>
  ),
});
