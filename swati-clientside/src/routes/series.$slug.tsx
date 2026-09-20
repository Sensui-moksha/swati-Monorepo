import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useSeriesBySlug, useSeriesBooks } from "@/lib/api/hooks";

export const Route = createFileRoute("/series/$slug")({
  component: SeriesDetailPage,
});

function SeriesDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useSeriesBySlug(slug);
  const series = data?.data;
  const { data: booksData } = useSeriesBooks(series?.id ?? "", { limit: 10 });
  const books = booksData?.data ?? [];

  if (isLoading)
    return (
      <PublicPage eyebrow="Loading…" title="">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/2" />
          <div className="h-20 bg-secondary rounded" />
        </div>
      </PublicPage>
    );
  if (!series)
    return (
      <PublicPage title="Series not found">
        <Link to="/series" className="text-primary hover:underline">
          ← All series
        </Link>
      </PublicPage>
    );

  return (
    <PublicPage eyebrow="Series" title={series.name} description={series.description}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {books.map((b) => (
          <Link
            key={b.id}
            to="/library/book/$slug"
            params={{ slug: b.slug }}
            className="group block"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md">
              <img
                src={b.coverImage ?? ""}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div className="mt-2 font-serif text-sm">{b.title}</div>
          </Link>
        ))}
      </div>
    </PublicPage>
  );
}
