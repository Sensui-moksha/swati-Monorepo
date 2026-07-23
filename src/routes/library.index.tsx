import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, SectionTitle } from "@/components/ui-primitives";
import { useBooks, useGenres, useCollections } from "@/lib/api/hooks";

export const Route = createFileRoute("/library/")({
  head: () => ({ meta: [{ title: "Library — Swathi Publications" }] }),
  component: LibraryIndex,
});

function LibraryIndex() {
  const { data: booksData, isLoading } = useBooks();
  const { data: genresData } = useGenres();
  const { data: collectionsData } = useCollections();
  const books = booksData?.data ?? [];
  const genres = genresData?.data ?? [];
  const collections = collectionsData?.data ?? [];

  return (
    <PublicPage eyebrow="Library" title="Library" description="The full Swathi Publications catalogue.">
      <div className="flex gap-2 flex-wrap mb-10">
        {["/library/new", "/library/trending", "/library/recommended", "/library/favorites", "/library/bookmarks", "/library/history", "/library/continue", "/library/recent"].map((h, i) => (
          <Link key={h} to={h as any} className="border border-rule px-4 py-1.5 rounded-full text-sm hover:bg-secondary">{["New", "Trending", "Recommended", "Favorites", "Bookmarks", "History", "Continue", "Recent"][i]}</Link>
        ))}
      </div>
      <SectionTitle eyebrow="Browse" title="All Books" />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">{books.map((b) => <BookCard key={b.id} book={b} />)}</div>
      )}
      {genres.length > 0 && (
        <>
          <SectionTitle eyebrow="Browse" title="Genres" />
          <div className="flex flex-wrap gap-2 mb-12">{genres.map((g) => (
            <Link key={g.id} to="/genres/$slug" params={{ slug: g.slug }} className="border border-rule px-4 py-2 rounded-full text-sm hover:bg-secondary">{g.name}</Link>
          ))}</div>
        </>
      )}
    </PublicPage>
  );
}
