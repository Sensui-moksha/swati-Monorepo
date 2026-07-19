import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { GENRES } from "@/lib/mock-extended";

export const Route = createFileRoute("/genres/")({
  component: () => (
    <PublicPage eyebrow="Browse" title="Genres" description="Every genre we publish across, from reference and textbook to essay and monograph.">
      <div className="grid md:grid-cols-3 gap-4">
        {GENRES.map((g) => (
          <Link key={g.slug} to="/genres/$slug" params={{ slug: g.slug }} className="block bg-paper border border-rule rounded p-6 hover:border-primary transition">
            <div className="font-serif text-xl">{g.name}</div>
            <div className="text-xs text-muted-foreground mt-2">{g.count} titles</div>
          </Link>
        ))}
      </div>
    </PublicPage>
  ),
});
