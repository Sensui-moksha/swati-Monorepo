import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, SectionTitle } from "@/components/ui-primitives";
import { PUBLISHERS } from "@/lib/mock-extended";
import { BOOKS } from "@/lib/mock-books";

export const Route = createFileRoute("/publishers/$slug")({
  loader: ({ params }) => {
    const pub = PUBLISHERS.find((p) => p.slug === params.slug);
    if (!pub) throw notFound();
    return { pub };
  },
  component: () => {
    const { pub } = Route.useLoaderData();
    return (
      <PublicPage eyebrow="Publisher" title={pub.name} description={`Founded ${pub.founded} in ${pub.location}. ${pub.titles} titles in print.`}>
        <SectionTitle title="Catalogue" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{BOOKS.map((b) => <BookCard key={b.id} book={b} />)}</div>
      </PublicPage>
    );
  },
  notFoundComponent: () => <PublicPage title="Publisher not found"><Link to="/publishers" className="text-primary hover:underline">← All publishers</Link></PublicPage>,
});
