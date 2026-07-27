import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard } from "@/components/ui-primitives";
import { useBookmarks } from "@/lib/api/hooks";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { data, isLoading } = useBookmarks();
  const savedItems = data?.data ?? [];

  return (
    <PublicPage eyebrow="My Library" title="Wishlist" description="Books and articles you have saved for later.">
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse aspect-[3/4] bg-secondary rounded" />
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="text-center py-16 border border-rule rounded bg-paper space-y-3">
          <div className="font-serif text-xl">Your wishlist is empty</div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Save books and magazines while browsing to read or purchase them later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {savedItems.map((item: any) => (
            <BookCard key={item.id || item.bookId} book={item.book || item} />
          ))}
        </div>
      )}
    </PublicPage>
  );
}
