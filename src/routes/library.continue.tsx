import { createFileRoute } from "@tanstack/react-router";
import { BookGridPage } from "@/components/book-grid-page";
import { READING_HISTORY } from "@/lib/mock-extended";
export const Route = createFileRoute("/library/continue")({
  component: () => <BookGridPage title="Continue Reading" description="Pick up where you left off." books={READING_HISTORY.map((r) => r.book)} />,
});
