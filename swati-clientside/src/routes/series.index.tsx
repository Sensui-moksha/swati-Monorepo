import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useSeries } from "@/lib/api/hooks";

export const Route = createFileRoute("/series/")({
  component: SeriesIndex,
});

function SeriesIndex() {
  const { data, isLoading } = useSeries();
  const items = data?.data ?? [];

  return (
    <PublicPage
      eyebrow="Browse"
      title="Series"
      description="Multi-volume works and curated reading sequences."
    >
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-secondary rounded-sm" />
              <div className="mt-2 h-4 bg-secondary rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((s) => (
            <Link
              key={s.id}
              to="/series/$slug"
              params={{ slug: s.slug }}
              className="group block bg-paper border border-rule rounded overflow-hidden"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={s.coverImage ?? ""}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-4">
                <div className="font-serif text-lg">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.bookCount} volumes</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
