import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, BookCard } from "@/components/ui-primitives";
import { useTrendingBooks } from "@/lib/api/hooks";

export const Route = createFileRoute("/dashboard/trending")({
  component: DashboardTrendingPage,
});

function DashboardTrendingPage() {
  const { data, isLoading } = useTrendingBooks();
  const books = data?.data ?? [];

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Trending"
        description="What readers are picking up this week."
      />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-secondary rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
