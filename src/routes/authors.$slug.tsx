import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, Btn, SectionTitle } from "@/components/ui-primitives";
import { useAuthorBySlug, useAuthorBooks } from "@/lib/api/hooks";

export const Route = createFileRoute("/authors/$slug")({
  head: () => ({ meta: [{ title: "Author — Swathi Publications" }] }),
  component: AuthorDetailPage,
  notFoundComponent: () => <PublicPage title="Author not found"><Link to="/authors" className="text-primary hover:underline">← All authors</Link></PublicPage>,
});

function AuthorDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useAuthorBySlug(slug);
  const author = data?.data;
  const { data: booksData } = useAuthorBooks(author?.id ?? '', { limit: 4 });
  const books = booksData?.data ?? [];

  if (isLoading) return <PublicPage eyebrow="Loading…" title=""><div className="animate-pulse space-y-4"><div className="h-40 w-40 bg-secondary rounded-full mx-auto" /><div className="h-8 bg-secondary rounded w-1/2 mx-auto" /></div></PublicPage>;
  if (!author) return <PublicPage title="Author not found"><Link to="/authors" className="text-primary hover:underline">← All authors</Link></PublicPage>;

  return (
    <PublicPage eyebrow="Author" title={author.name} description={author.bio?.slice(0, 80)}>
      <div className="grid md:grid-cols-[240px_1fr] gap-10 mb-12">
        <div className="w-40 h-40 rounded-full bg-primary/10 text-primary grid place-items-center font-serif text-6xl mx-auto md:mx-0">{author.name[0]}</div>
        <div>
          <p className="font-serif text-lg leading-relaxed">{author.bio}</p>
          <div className="mt-6 flex gap-4"><Btn>Follow</Btn><Btn variant="outline">Contact</Btn></div>
          <div className="mt-6 text-sm text-muted-foreground flex gap-6"><span><strong className="text-foreground">{author.bookCount}</strong> books</span></div>
        </div>
      </div>
      {books.length > 0 && (
        <>
          <SectionTitle title="Titles" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{books.map((b) => <BookCard key={b.id} book={b} />)}</div>
        </>
      )}
    </PublicPage>
  );
}
