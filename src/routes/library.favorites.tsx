import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { FAVORITES } from "@/lib/mock-extended";
export const Route = createFileRoute("/library/favorites")({
  component: () => <BookGridPage title="Favorites" description="Books you love." books={FAVORITES} />,
});
