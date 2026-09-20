import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useFavorites } from "@/lib/api/hooks";

export const Route = createFileRoute("/library/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { data } = useFavorites();
  return (
    <PublicPage
      eyebrow="Library"
      title="Favorites"
      description="Books and articles you've marked as favorites."
    >
      <div className="text-sm text-muted-foreground py-8 text-center">
        Your favorites will appear here.
      </div>
    </PublicPage>
  );
}
