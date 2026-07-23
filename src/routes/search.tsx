import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useGlobalSearch } from "@/lib/api/hooks";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGlobalSearch(query);
  const results = data?.data ?? [];

  return (
    <PublicPage eyebrow="Search" title="Search" description="Search across articles, books, and publications.">
      <div className="mb-8 relative max-w-2xl">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles, authors, topics..." className="w-full border border-rule pl-10 pr-4 py-3 rounded-md bg-paper" />
      </div>
      {isLoading && query.length > 1 && <div className="text-sm text-muted-foreground">Searching…</div>}
      {results.length > 0 && (
        <ul className="divide-y divide-rule">
          {results.map((a) => (
            <li key={a.id} className="py-4">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="group">
                <div className="font-serif text-lg group-hover:text-primary">{a.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{a.excerpt}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {query.length > 1 && !isLoading && results.length === 0 && <div className="text-sm text-muted-foreground">No results found for "{query}"</div>}
    </PublicPage>
  );
}
