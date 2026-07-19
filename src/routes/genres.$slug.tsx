import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard } from "@/components/ui-primitives";
import { GENRES } from "@/lib/mock-extended";
import { BOOKS } from "@/lib/mock-books";

export const Route = createFileRoute("/genres/$slug")({
  loader: ({ params }) => { const g = GENRES.find((x) => x.slug === params.slug); if (!g) throw notFound(); return { g }; },
  component: () => {
    const { g } = Route.useLoaderData();
    return (
      <PublicPage eyebrow="Genre" title={g.name} description={`${g.count} titles in this genre.`}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{BOOKS.map((b) => <BookCard key={b.id} book={b} />)}</div>
      </PublicPage>
    );
  },
  notFoundComponent: () => <PublicPage title="Genre not found"><Link to="/genres" className="text-primary hover:underline">← All genres</Link></PublicPage>,
});
