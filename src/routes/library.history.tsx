import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { READING_HISTORY } from "@/lib/mock-extended";
export const Route = createFileRoute("/library/history")({
  component: () => <BookGridPage title="Reading History" description="Everything you've read." books={READING_HISTORY.map((r) => r.book)} />,
});
