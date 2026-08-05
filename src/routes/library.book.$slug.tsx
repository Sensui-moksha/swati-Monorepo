import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { Btn, BookCard, SectionTitle } from "@/components/ui-primitives";
import { useBookBySlug, useBooks } from "@/lib/api/hooks";
import { BookOpen, ShoppingCart, Bookmark, Share2, Star } from "lucide-react";
import { useState, lazy, Suspense } from "react";

const PdfBookViewer = lazy(() => import("@/components/PdfBookViewer").then(m => ({ default: m.PdfBookViewer })));

export const Route = createFileRoute("/library/book/$slug")({
  head: () => ({ meta: [{ title: "Book — Swathi Publications" }] }),
  component: BookDetailPage,
  notFoundComponent: () => <PublicPage title="Book not found"><Link to="/library" className="text-primary hover:underline">← Back to library</Link></PublicPage>,
});

import { PdfThumbnail } from "@/components/PdfThumbnail";

function BookDetailPage() {
  const { slug } = Route.useParams();
  const { data: bookData, isLoading: bookLoading } = useBookBySlug(slug);
  const { data: allBooksData } = useBooks({ limit: 5 });
  const book = bookData?.data;
  const allBooks = allBooksData?.data ?? [];
  const related = allBooks.filter((b) => b.id !== book?.id).slice(0, 4);
  const [isBookViewerOpen, setIsBookViewerOpen] = useState(false);

  if (bookLoading) {
    return (
      <PublicPage eyebrow="Loading…" title="">
        <div className="grid md:grid-cols-[320px_1fr] gap-10 animate-pulse">
          <div className="aspect-[3/4] bg-secondary rounded-sm" />
          <div className="space-y-4"><div className="h-8 bg-secondary rounded w-1/2" /><div className="h-4 bg-secondary rounded w-3/4" /><div className="h-40 bg-secondary rounded" /></div>
        </div>
      </PublicPage>
    );
  }

  if (!book) {
    return <PublicPage title="Book not found"><Link to="/library" className="text-primary hover:underline">← Back to library</Link></PublicPage>;
  }

  const pdfUrl = (book as any).pdfUrl || "/documents/weekly/32 Pages/10,11.pdf";

  return (
    <PublicPage eyebrow={book.format ?? "Book"} title={book.title} description={book.description}>
      <div className="grid md:grid-cols-[320px_1fr] gap-10 mb-16">
        <div>
          <div className="relative shadow-2xl rounded-sm overflow-hidden">
            <PdfThumbnail src={book.coverImage || pdfUrl} alt={book.title} className="w-full aspect-[3/4] object-cover" />
            <div className="absolute inset-y-0 left-0 w-3 bg-black/30" />
          </div>
          <div className="mt-4 flex gap-2">
            <Btn onClick={() => setIsBookViewerOpen(true)} className="flex-1"><BookOpen className="w-4 h-4 mr-2" />Read Book</Btn>
            <Link to="/cart"><Btn variant="outline"><ShoppingCart className="w-4 h-4" /></Btn></Link>
            <Btn variant="outline"><Bookmark className="w-4 h-4" /></Btn>
            <Btn variant="outline"><Share2 className="w-4 h-4" /></Btn>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-4">By {book.author?.name ?? 'Unknown'}</div>
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-primary text-primary" />{book.price}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{book.pageCount ?? 0} pages</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{book.language}</span>
          </div>
          <p className="font-serif text-lg leading-relaxed">{book.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-rule text-sm">
            <div><div className="text-xs uppercase text-muted-foreground">Publisher</div><div>{book.publisher?.name ?? 'Swathi Publications'}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Year</div><div>{book.publishedAt ? new Date(book.publishedAt).getFullYear() : '—'}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">ISBN</div><div>{book.isbn ?? '—'}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Price</div><div className="font-serif text-lg text-primary">₹{book.price}</div></div>
          </div>
          {book.chapters && book.chapters.length > 0 && (
            <div className="mt-8">
              <div className="text-xs uppercase text-muted-foreground mb-3">Table of Contents</div>
              <ul className="space-y-2">
                {book.chapters.map((c) => (
                  <li key={c.id} className="flex justify-between border-b border-rule/50 pb-2 text-sm"><span>{c.title}</span><span className="text-muted-foreground tabular-nums">{c.number}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <>
          <SectionTitle eyebrow="You may also enjoy" title="Related Titles" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </>
      )}
      {isBookViewerOpen && (
        <Suspense fallback={null}>
          <PdfBookViewer
            isOpen={isBookViewerOpen}
            onClose={() => setIsBookViewerOpen(false)}
            title={book.title}
            pdfUrl={pdfUrl}
          />
        </Suspense>
      )}
    </PublicPage>
  );
}
