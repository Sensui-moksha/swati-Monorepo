import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, BookCard } from "@/components/ui-primitives";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/dashboard/recommended")({
  component: () => (
    <DashboardShell>
      <PageHeader eyebrow="For you" title="Recommended" description="Chosen from your reading and browsing history." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{BOOKS.map((b) => <BookCard key={b.id} book={b} />)}</div>
    </DashboardShell>
  ),
});
