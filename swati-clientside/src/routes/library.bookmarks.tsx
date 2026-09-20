import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useBookmarks } from "@/lib/api/hooks";

export const Route = createFileRoute("/library/bookmarks")({
  component: BookmarksPage,
});

function BookmarksPage() {
  const { data } = useBookmarks();
  return (
    <PublicPage
      eyebrow="Library"
      title="Bookmarks"
      description="Pages and passages you've saved for later."
    >
      <div className="text-sm text-muted-foreground py-8 text-center">
        Your bookmarks will appear here once you start saving pages.
      </div>
    </PublicPage>
  );
}
