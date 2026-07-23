import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { usePublishers } from "@/lib/api/hooks";

export const Route = createFileRoute("/publishers/")({
  component: PublishersIndex,
});

function PublishersIndex() {
  const { data, isLoading } = usePublishers();
  const items = data?.data ?? [];

  return (
    <PublicPage eyebrow="Browse" title="Publishers" description="The publishing houses behind our catalogue.">
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse h-32 bg-secondary rounded" />)}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((p) => (
            <Link key={p.id} to="/publishers/$slug" params={{ slug: p.slug }} className="block bg-paper border border-rule rounded p-6 hover:border-primary">
              <div className="font-serif text-xl">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.bookCount} titles</div>
              {p.description && <div className="text-sm text-muted-foreground mt-2">{p.description}</div>}
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
