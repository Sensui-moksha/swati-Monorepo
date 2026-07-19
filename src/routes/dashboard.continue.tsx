import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader } from "@/components/ui-primitives";
import { READING_HISTORY } from "@/lib/mock-extended";
export const Route = createFileRoute("/dashboard/continue")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Dashboard" title="Continue Reading" description="Books you've started, waiting for you." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{READING_HISTORY.map((r) => (
        <Link key={r.book.id} to="/reader/$bookId" params={{ bookId: r.book.id }} className="group block">
          <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md relative">
            <img src={r.book.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20"><div className="h-full bg-primary" style={{ width: `${r.progress}%` }} /></div>
          </div>
          <div className="mt-3 font-serif text-sm">{r.book.title}</div>
          <div className="text-xs text-muted-foreground">Page {r.page} · {r.progress}% · {r.lastRead}</div>
        </Link>
      ))}</div>
    </DashboardShell>
  ),
});
