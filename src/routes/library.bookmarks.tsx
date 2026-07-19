import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKMARKS } from "@/lib/mock-extended";
export const Route = createFileRoute("/library/bookmarks")({
  component: () => <BookGridPage title="Bookmarks" description="Titles you've saved for later." books={BOOKMARKS.map((b) => b.book)} />,
});
