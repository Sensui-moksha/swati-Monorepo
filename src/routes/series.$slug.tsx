import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard } from "@/components/ui-primitives";
import { SERIES } from "@/lib/mock-extended";
import { BOOKS } from "@/lib/mock-books";

export const Route = createFileRoute("/series/$slug")({
  loader: ({ params }) => { const s = SERIES.find((x) => x.slug === params.slug); if (!s) throw notFound(); return { s }; },
  component: () => {
    const { s } = Route.useLoaderData();
    return (
      <PublicPage eyebrow="Series" title={s.name} description={`${s.volumes} volumes in this series.`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{BOOKS.slice(0, s.volumes).map((b) => <BookCard key={b.id} book={b} />)}</div>
      </PublicPage>
    );
  },
  notFoundComponent: () => <PublicPage title="Series not found"><Link to="/series" className="text-primary hover:underline">← All series</Link></PublicPage>,
});
