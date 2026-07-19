import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/library/recent")({
  component: () => <BookGridPage title="Recently Viewed" description="Titles you've opened this session." books={BOOKS.slice(2, 6)} />,
});
