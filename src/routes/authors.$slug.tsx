import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, Btn, SectionTitle } from "@/components/ui-primitives";
import { AUTHORS } from "@/lib/mock-extended";
import { BOOKS } from "@/lib/mock-books";

export const Route = createFileRoute("/authors/$slug")({
  loader: ({ params }) => {
    const author = AUTHORS.find((a) => a.slug === params.slug);
    if (!author) throw notFound();
    return { author };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.author.name} — Swathi Publications` : "Author" }] }),
  component: () => {
    const { author } = Route.useLoaderData();
    return (
      <PublicPage eyebrow="Author" title={author.name} description={author.role}>
        <div className="grid md:grid-cols-[240px_1fr] gap-10 mb-12">
          <div className="w-40 h-40 rounded-full bg-primary/10 text-primary grid place-items-center font-serif text-6xl mx-auto md:mx-0">{author.name[0]}</div>
          <div>
            <p className="font-serif text-lg leading-relaxed">{author.bio}</p>
            <div className="mt-6 flex gap-4"><Btn>Follow</Btn><Btn variant="outline">Contact</Btn></div>
            <div className="mt-6 text-sm text-muted-foreground flex gap-6"><span><strong className="text-foreground">{author.books}</strong> books</span><span><strong className="text-foreground">{author.followers.toLocaleString()}</strong> followers</span></div>
          </div>
        </div>
        <SectionTitle title="Titles" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{BOOKS.slice(0, 4).map((b) => <BookCard key={b.id} book={b} />)}</div>
      </PublicPage>
    );
  },
  notFoundComponent: () => <PublicPage title="Author not found"><Link to="/authors" className="text-primary hover:underline">← All authors</Link></PublicPage>,
});
