import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, BookCard } from "@/components/ui-primitives";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/dashboard/trending")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="Popular" title="Trending" description="What everyone is reading right now." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{[...BOOKS].reverse().map((b) => <BookCard key={b.id} book={b} />)}</div>
    </DashboardShell>
  ),
});
