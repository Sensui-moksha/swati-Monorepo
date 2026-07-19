import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard } from "@/components/ui-primitives";
import { BOOKS } from "@/lib/mock-books";
export const Route = createFileRoute("/collections/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    const title = slug.replace(/-/g,' ').replace(/\b\w/g, (c: string)=>c.toUpperCase());
    return (
      <PublicPage eyebrow="Collection" title={title} description="A curated selection from our editors.">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{BOOKS.map((b)=>(<BookCard key={b.id} book={b} />))}</div>
      </PublicPage>
    );
  },
});
