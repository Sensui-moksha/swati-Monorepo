import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, SectionTitle } from "@/components/ui-primitives";
import { BOOKS } from "@/lib/mock-books";
import { COLLECTIONS, GENRES } from "@/lib/mock-extended";

export const Route = createFileRoute("/library/")({
  head: () => ({ meta: [{ title: "Digital Library — Swathi Publications" }, { name: "description", content: "Browse the complete Swathi Publications digital library." }] }),
  component: () => (
    <PublicPage eyebrow="Digital Library" title="The Complete Library" description="Every title Swathi Publications has ever printed, in one continuously updated shelf.">
      <div className="mb-10 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
        {["/library/bookmarks","/library/favorites","/library/history","/library/continue","/library/recommended","/library/trending","/library/new"].map((h, i) => (
          <Link key={h} to={h as any} className="border border-rule px-3 py-1.5 rounded hover:bg-secondary">{["Bookmarks","Favorites","History","Continue","Recommended","Trending","New Releases"][i]}</Link>
        ))}
      </div>
      <SectionTitle eyebrow="Browse" title="All Titles" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {BOOKS.map((b) => <BookCard key={b.id} book={{ ...b, category: b.category }} />)}
      </div>
      <div className="mt-16"><SectionTitle eyebrow="Curated" title="Collections" /></div>
      <div className="grid md:grid-cols-3 gap-6">
        {COLLECTIONS.map((c) => (
          <Link key={c.slug} to="/collections/$slug" params={{ slug: c.slug }} className="group block border border-rule rounded overflow-hidden bg-paper">
            <div className="h-40 overflow-hidden"><img src={c.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
            <div className="p-4"><div className="font-serif text-lg">{c.name}</div><div className="text-xs text-muted-foreground mt-1">{c.count} titles</div></div>
          </Link>
        ))}
      </div>
      <div className="mt-16"><SectionTitle eyebrow="By" title="Genres" /></div>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => <Link key={g.slug} to="/genres/$slug" params={{ slug: g.slug }} className="border border-rule rounded-full px-4 py-1.5 text-sm hover:bg-secondary">{g.name} <span className="text-muted-foreground">·{g.count}</span></Link>)}
      </div>
    </PublicPage>
  ),
});
