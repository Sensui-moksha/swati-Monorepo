import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, SectionTitle } from "@/components/ui-primitives";
import { useBooks, useCollections, useTags } from "@/lib/api/hooks";
import { Search } from "lucide-react";

export const Route = createFileRoute("/discover/")({
  head: () => ({ meta: [{ title: "Discover — Swathi Publications" }] }),
  component: DiscoverIndex,
});

function DiscoverIndex() {
  const { data: booksData, isLoading } = useBooks();
  const { data: collectionsData } = useCollections();
  const { data: tagsData } = useTags();
  const books = booksData?.data ?? [];
  const collections = collectionsData?.data ?? [];
  const tags = tagsData?.data ?? [];

  return (
    <PublicPage eyebrow="Discover" title="Discover" description="New titles, trending reads, and curated collections chosen for you.">
      <div className="mb-8 relative max-w-2xl">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Search titles, authors, topics..." className="w-full border border-rule pl-10 pr-4 py-3 rounded-md bg-paper" />
      </div>
      <div className="flex gap-2 flex-wrap mb-10">
        {["/discover/trending","/discover/new","/discover/recommendations","/discover/saved-searches","/discover/history"].map((h, i) => (
          <Link key={h} to={h as any} className="border border-rule px-4 py-1.5 rounded-full text-sm hover:bg-secondary">{["Trending","New","Recommendations","Saved Searches","Search History"][i]}</Link>
        ))}
      </div>
      <SectionTitle eyebrow="Popular" title="Trending This Week" href="/discover/trending" />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">{books.map((b) => <BookCard key={b.id} book={b} />)}</div>
      )}
      {collections.length > 0 && (
        <>
          <SectionTitle eyebrow="Curated" title="Collections for You" />
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {collections.slice(0, 3).map((c) => (
              <Link key={c.id} to="/collections/$slug" params={{ slug: c.slug }} className="group block bg-paper border border-rule rounded overflow-hidden">
                <div className="h-40 overflow-hidden"><img src={c.coverImage ?? ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
                <div className="p-4"><div className="font-serif text-lg">{c.title}</div><div className="text-xs text-muted-foreground mt-1">{c.issueCount} titles</div></div>
              </Link>
            ))}
          </div>
        </>
      )}
      {tags.length > 0 && (
        <>
          <SectionTitle title="Topics & Tags" />
          <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t.id} className="border border-rule px-3 py-1 rounded-full text-xs">{t.name}</span>)}</div>
        </>
      )}
    </PublicPage>
  );
}
