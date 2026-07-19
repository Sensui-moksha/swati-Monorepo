import { BOOKS } from "@/lib/mock-books";
import { BookCard } from "@/components/ui-primitives";
import { PublicPage } from "@/components/shells";

export function BookGridPage({ title, description, books = BOOKS, eyebrow }:
  { title: string; description?: string; books?: typeof BOOKS; eyebrow?: string }) {
  return (
    <PublicPage eyebrow={eyebrow} title={title} description={description}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {books.map((b) => <BookCard key={b.id} book={b} />)}
      </div>
    </PublicPage>
  );
}
