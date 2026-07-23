import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard } from "@/components/ui-primitives";
import { useBooks } from "@/lib/api/hooks";

export const Route = createFileRoute("/library/recent")({
  component: LibraryRecentPage,
});

function LibraryRecentPage() {
  const { data, isLoading } = useBooks({ limit: 12 });
  const books = data?.data ?? [];

  return (
    <PublicPage eyebrow="Library" title="Recently Added" description="Titles recently added to the library.">
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{books.map((b) => <BookCard key={b.id} book={b} />)}</div>
      )}
    </PublicPage>
  );
}
