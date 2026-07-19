import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/library/recommended")({
  component: () => <BookGridPage title="Recommended For You" description="Curated based on your reading." books={BOOKS.slice(0, 6)} />,
});
