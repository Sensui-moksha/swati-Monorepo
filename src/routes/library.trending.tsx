import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/library/trending")({
  component: () => <BookGridPage title="Trending Now" description="What readers are opening this week." books={[...BOOKS].reverse()} />,
});
