import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/library/new")({
  component: () => <BookGridPage title="New Releases" description="Fresh off the press." books={BOOKS.slice(0, 4)} />,
});
