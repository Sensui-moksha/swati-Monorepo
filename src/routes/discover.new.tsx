import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/discover/new")({
  component: () => <BookGridPage eyebrow="Discover" title="New Releases" description="Just published, freshly bound." books={BOOKS.slice(0, 4)} />,
});
