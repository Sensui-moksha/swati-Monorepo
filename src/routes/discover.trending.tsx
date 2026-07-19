import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/discover/trending")({
  component: () => <BookGridPage eyebrow="Discover" title="Trending" description="The most-opened titles this week." books={[...BOOKS].reverse()} />,
});
