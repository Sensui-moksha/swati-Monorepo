import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { Btn, BookCard, SectionTitle } from "@/components/ui-primitives";
import { bookBySlug, BOOKS } from "@/lib/mock-books";
import { BookOpen, ShoppingCart, Bookmark, Share2, Star } from "lucide-react";

export const Route = createFileRoute("/library/book/$slug")({
  loader: ({ params }) => {
    const book = bookBySlug(params.slug);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.book.title} — Swathi Publications` : "Book" }] }),
  component: () => {
    const { book } = Route.useLoaderData();
    const related = BOOKS.filter((b) => b.id !== book.id).slice(0, 4);
    return (
      <PublicPage eyebrow={book.category} title={book.title} description={book.subtitle}>
        <div className="grid md:grid-cols-[320px_1fr] gap-10 mb-16">
          <div>
            <div className="relative shadow-2xl rounded-sm overflow-hidden">
              <img src={book.cover} alt={book.title} className="w-full aspect-[3/4] object-cover" />
              <div className="absolute inset-y-0 left-0 w-3 bg-black/30" />
            </div>
            <div className="mt-4 flex gap-2">
              <Link to="/reader/$bookId" params={{ bookId: book.id }} className="flex-1"><Btn className="w-full"><BookOpen className="w-4 h-4 mr-2" />Read Now</Btn></Link>
              <Link to="/cart"><Btn variant="outline"><ShoppingCart className="w-4 h-4" /></Btn></Link>
              <Btn variant="outline"><Bookmark className="w-4 h-4" /></Btn>
              <Btn variant="outline"><Share2 className="w-4 h-4" /></Btn>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-4">By {book.author}</div>
            <div className="flex items-center gap-4 mb-6 text-sm">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-primary text-primary" />{book.rating}</span>
              <span className="text-muted-foreground">{book.reviews} reviews</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{book.pageCount} pages</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{book.language}</span>
            </div>
            <p className="font-serif text-lg leading-relaxed">{book.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-rule text-sm">
              <div><div className="text-xs uppercase text-muted-foreground">Publisher</div><div>{book.publisher}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">Year</div><div>{book.year}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">ISBN</div><div>{book.isbn}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">Price</div><div className="font-serif text-lg text-primary">₹{book.price}</div></div>
            </div>
            <div className="mt-8">
              <div className="text-xs uppercase text-muted-foreground mb-3">Table of Contents</div>
              <ul className="space-y-2">
                {book.chapters.map((c: { title: string; page: number }) => (
                  <li key={c.page} className="flex justify-between border-b border-rule/50 pb-2 text-sm"><span>{c.title}</span><span className="text-muted-foreground tabular-nums">{c.page}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <SectionTitle eyebrow="You may also enjoy" title="Related Titles" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </PublicPage>
    );
  },
  notFoundComponent: () => <PublicPage title="Book not found"><Link to="/library" className="text-primary hover:underline">← Back to library</Link></PublicPage>,
});
