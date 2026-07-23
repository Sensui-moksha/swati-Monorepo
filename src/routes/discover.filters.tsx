import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useGenres, useTags } from "@/lib/api/hooks";

export const Route = createFileRoute("/discover/filters")({
  component: FiltersPage,
});

function FiltersPage() {
  const { data: genresData } = useGenres();
  const { data: tagsData } = useTags();
  const genres = genresData?.data ?? [];
  const tags = tagsData?.data ?? [];

  return (
    <PublicPage eyebrow="Discover" title="Filters" description="Browse by genre, tag, or topic.">
      {genres.length > 0 && (
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Genres</div>
          <div className="flex flex-wrap gap-2">{genres.map((g) => <span key={g.id} className="border border-rule px-4 py-2 rounded-full text-sm hover:bg-secondary cursor-pointer">{g.name}</span>)}</div>
        </div>
      )}
      {tags.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Tags</div>
          <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t.id} className="border border-rule px-3 py-1 rounded-full text-xs hover:bg-secondary cursor-pointer">{t.name}</span>)}</div>
        </div>
      )}
    </PublicPage>
  );
}
