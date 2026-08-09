import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useGenres } from "@/lib/api/hooks";

export const Route = createFileRoute("/genres/")({
  component: GenresIndex,
});

function GenresIndex() {
  const { data, isLoading } = useGenres();
  const genres = data?.data ?? [];

  return (
    <PublicPage
      eyebrow="Browse"
      title="Genres"
      description="Every genre we publish across, from reference and textbook to essay and monograph."
    >
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-secondary rounded" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {genres.map((g) => (
            <Link
              key={g.slug}
              to="/genres/$slug"
              params={{ slug: g.slug }}
              className="block bg-paper border border-rule rounded p-6 hover:border-primary transition"
            >
              <div className="font-serif text-xl">{g.name}</div>
              <div className="text-xs text-muted-foreground mt-2">{g.bookCount} titles</div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
