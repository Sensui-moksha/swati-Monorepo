import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ARTICLES } from "@/lib/mock-data";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Swathi Publications" }] }),
  component: () => {
    const [q, setQ] = useState("");
    const results = q ? ARTICLES.filter((a) => (a.title + a.summary).toLowerCase().includes(q.toLowerCase())) : [];
    return (
      <SiteLayout>
        <div className="container-edit py-14 max-w-3xl">
          <div className="eyebrow">Archive</div>
          <h1 className="mt-2 font-serif text-5xl">Search</h1>
          <div className="mt-8 relative">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles, topics..." className="w-full border border-input pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-primary" />
          </div>
          {q && <div className="mt-4 text-sm text-muted-foreground">{results.length} results for "{q}"</div>}
          <ul className="mt-8 divide-y divide-rule">
            {results.map((a) => (
              <li key={a.id} className="py-5">
                <Link to="/articles/$slug" params={{ slug: a.slug }} className="block group">
                  <div className="eyebrow">{a.categoryName}</div>
                  <h3 className="mt-1 font-serif text-xl group-hover:text-primary">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SiteLayout>
    );
  },
});
