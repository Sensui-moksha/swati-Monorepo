import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useReadingHistory } from "@/lib/api/hooks";

export const Route = createFileRoute("/library/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { data } = useReadingHistory();
  return (
    <PublicPage
      eyebrow="Library"
      title="Reading History"
      description="Everything you've read, in order."
    >
      <div className="text-sm text-muted-foreground py-8 text-center">
        Your reading history will appear here.
      </div>
    </PublicPage>
  );
}
