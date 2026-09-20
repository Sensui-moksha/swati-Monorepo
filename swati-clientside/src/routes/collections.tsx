import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useAdminGeneric } from "@/lib/api/hooks";

export const Route = createFileRoute("/collections")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data, isLoading } = useAdminGeneric("collections");
  const collections = data?.data ?? [];

  return (
    <PublicPage
      eyebrow="Browse"
      title="Collections"
      description="Curated reading collections and themed bundles."
    >
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-secondary rounded" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No collections published yet. Check back soon!
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {collections.map((c: any) => (
            <Link
              key={c.id || c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug || c.id || "general" }}
              className="block bg-paper border border-rule rounded-md p-6 hover:border-primary transition space-y-2"
            >
              <div className="font-serif text-xl font-semibold">{c.name || c.title}</div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {c.description || "Curated editorial selection."}
              </p>
              <div className="text-xs font-medium text-primary pt-2">View Collection →</div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
