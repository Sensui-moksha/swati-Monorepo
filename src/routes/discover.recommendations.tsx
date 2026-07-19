import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/discover/recommendations")({
  component: () => <BookGridPage eyebrow="Discover" title="Recommendations" description="Picked based on what you've read and saved." books={BOOKS.slice(1)} />,
});
