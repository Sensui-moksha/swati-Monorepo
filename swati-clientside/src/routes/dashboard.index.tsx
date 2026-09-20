import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, BookCard, SectionTitle, KpiCard, Card } from "@/components/ui-primitives";
import { useBooks, useNotifications, useArticles, useContinueReading } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { data: booksData } = useBooks({ limit: 4 });
  const { data: notifData } = useNotifications({ limit: 4 } as any);
  const { data: articlesData } = useArticles({ limit: 5 });
  const { data: continueData } = useContinueReading();

  const books = booksData?.data ?? [];
  const notifications = notifData?.data ?? [];
  const articles = articlesData?.data ?? [];
  const continueReading = continueData?.data ?? [];

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back, Reader"
        description="Your personal reading room. Continue where you left off and see what's new."
      />
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Books read" value="24" delta={12} />
        <KpiCard label="Hours this month" value="42" delta={8} />
        <KpiCard label="Bookmarks" value="18" />
        <KpiCard label="Streak" value="14 days" delta={4} />
      </div>
      <SectionTitle eyebrow="Continue" title="Continue Reading" href="/dashboard/continue" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {continueReading.slice(0, 4).map((b) => (
          <Link key={b.id} to="/reader/$bookId" params={{ bookId: b.id }} className="block group">
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md relative">
              <img
                src={b.coverImage ?? ""}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div className="mt-2 font-serif text-sm">{b.title}</div>
          </Link>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card title="Latest articles" className="md:col-span-2">
          <ul className="space-y-3">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="flex justify-between gap-4 hover:text-primary"
                >
                  <span className="font-serif truncate">{a.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {a.publishedAt ? formatShortDate(a.publishedAt) : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          title="Notifications"
          action={
            <Link to="/dashboard/notifications" className="text-xs text-primary hover:underline">
              All →
            </Link>
          }
        >
          <ul className="space-y-3 text-sm">
            {notifications.slice(0, 4).map((n: any) => (
              <li key={n.id} className="border-b border-rule/50 pb-2">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">
                  {n.createdAt ? formatShortDate(n.createdAt) : ""}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <SectionTitle eyebrow="For you" title="Recommended" href="/dashboard/recommended" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {books.slice(0, 4).map((b) => (
          <BookCard key={b.id} book={b} size="sm" />
        ))}
      </div>
    </DashboardShell>
  );
}
