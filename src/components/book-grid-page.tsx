import { BookCard } from "@/components/ui-primitives";
import { PublicPage } from "@/components/shells";
import { useBooks } from "@/lib/api/hooks";

export function BookGridPage({ title, description, eyebrow }:
  { title: string; description?: string; eyebrow?: string }) {
  const { data, isLoading } = useBooks();
  const books = data?.data ?? [];

  return (
    <PublicPage eyebrow={eyebrow} title={title} description={description}>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </PublicPage>
  );
}
