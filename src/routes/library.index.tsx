import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, SectionTitle } from "@/components/ui-primitives";
import { useBooks } from "@/lib/api/hooks";
import { DateFilterControl, DateFilterValue, isItemInDateRange } from "@/components/DateFilterControl";

export const Route = createFileRoute("/library/")({
  head: () => ({ meta: [{ title: "Library — Swathi Publications" }] }),
  component: LibraryIndex,
});

function LibraryIndex() {
  const { data: booksData, isLoading } = useBooks();
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ preset: "all" });
  const books = booksData?.data ?? [];

  const filteredBooks = books.filter((b) => isItemInDateRange(b, (book) => book.publishedAt, dateFilter));

  return (
    <PublicPage eyebrow="Library" title="Library" description="The full Swathi Publications catalogue.">
      <div className="flex gap-2 flex-wrap mb-8">
        {["/library/new", "/library/trending", "/library/recommended", "/library/favorites", "/library/bookmarks", "/library/history", "/library/continue", "/library/recent"].map((h, i) => (
          <Link key={h} to={h as any} className="border border-rule px-4 py-1.5 rounded-full text-sm hover:bg-secondary">{["New", "Trending", "Recommended", "Favorites", "Bookmarks", "History", "Continue", "Recent"][i]}</Link>
        ))}
      </div>

      {/* Filter by Date Bar */}
      <div className="mb-8 p-4 bg-paper border border-rule rounded-xl shadow-xs">
        <DateFilterControl value={dateFilter} onChange={setDateFilter} />
      </div>

      <SectionTitle eyebrow="Browse" title="All Books" />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}</div>
      ) : filteredBooks.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">No books found for the selected date range.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
          {filteredBooks.map((b, idx) => <BookCard key={b.id} book={b} index={idx} />)}
        </div>
      )}
    </PublicPage>
  );
}
