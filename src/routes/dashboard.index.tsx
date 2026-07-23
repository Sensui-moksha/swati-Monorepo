import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, BookCard, SectionTitle, KpiCard, Card } from "@/components/ui-primitives";
import { BOOKS } from "@/lib/mock-books";
import { NOTIFICATIONS, READING_HISTORY } from "@/lib/mock-extended";
import { ARTICLES, formatShortDate } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Dashboard" title="Welcome back, Reader" description="Your personal reading room. Continue where you left off and see what's new." />
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Books read" value="24" delta={12} />
        <KpiCard label="Hours this month" value="42" delta={8} />
        <KpiCard label="Bookmarks" value="18" />
        <KpiCard label="Streak" value="14 days" delta={4} />
      </div>
      <SectionTitle eyebrow="Continue" title="Continue Reading" href="/dashboard/continue" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {READING_HISTORY.map((r) => (
          <Link key={r.book.id} to="/reader/$bookId" params={{ bookId: r.book.id }} className="block group">
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md relative">
              <img src={r.book.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20"><div className="h-full bg-primary" style={{ width: `${r.progress}%` }} /></div>
            </div>
            <div className="mt-2 font-serif text-sm">{r.book.title}</div>
            <div className="text-xs text-muted-foreground">Page {r.page} · {r.lastRead}</div>
          </Link>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card title="Latest articles" className="md:col-span-2">
          <ul className="space-y-3">{ARTICLES.slice(0, 5).map((a) => (
            <li key={a.id}><Link to="/articles/$slug" params={{ slug: a.slug }} className="flex justify-between gap-4 hover:text-primary"><span className="font-serif truncate">{a.title}</span><span className="text-xs text-muted-foreground shrink-0">{formatShortDate(a.date)}</span></Link></li>
          ))}</ul>
        </Card>
        <Card title="Notifications" action={<Link to="/dashboard/notifications" className="text-xs text-primary hover:underline">All →</Link>}>
          <ul className="space-y-3 text-sm">{NOTIFICATIONS.slice(0, 4).map((n) => (
            <li key={n.id} className="border-b border-rule/50 pb-2"><div className="font-medium">{n.title}</div><div className="text-xs text-muted-foreground">{n.time}</div></li>
          ))}</ul>
        </Card>
      </div>
      <SectionTitle eyebrow="For you" title="Recommended" href="/dashboard/recommended" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">{BOOKS.slice(0, 4).map((b) => <BookCard key={b.id} book={b} size="sm" />)}</div>
    </DashboardShell>
  ),
});
