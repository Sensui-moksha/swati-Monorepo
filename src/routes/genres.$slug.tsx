import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard } from "@/components/ui-primitives";
import { useGenreBySlug, useBooks } from "@/lib/api/hooks";

export const Route = createFileRoute("/genres/$slug")({
  component: GenreDetailPage,
  notFoundComponent: () => <PublicPage title="Genre not found"><Link to="/genres" className="text-primary hover:underline">← All genres</Link></PublicPage>,
});

function GenreDetailPage() {
  const { slug } = Route.useParams();
  const { data: genreData, isLoading: genreLoading } = useGenreBySlug(slug);
  const genre = genreData?.data;
  const { data: booksData, isLoading: booksLoading } = useBooks({ genreId: genre?.id } as any);
  const books = booksData?.data ?? [];

  if (genreLoading) return <PublicPage eyebrow="Loading…" title=""><div className="animate-pulse h-8 bg-secondary rounded w-1/2" /></PublicPage>;
  if (!genre) return <PublicPage title="Genre not found"><Link to="/genres" className="text-primary hover:underline">← All genres</Link></PublicPage>;

  return (
    <PublicPage eyebrow="Genre" title={genre.name} description={`${genre.bookCount} titles in this genre.`}>
      {booksLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{books.map((b) => <BookCard key={b.id} book={b} />)}</div>
      )}
    </PublicPage>
  );
}
