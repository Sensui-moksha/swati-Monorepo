import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { usePublications } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { PdfThumbnail } from "@/components/PdfThumbnail";

export const Route = createFileRoute("/publications/special")({
  component: SpecialPage,
});

function SpecialPage() {
  const { data, isLoading } = usePublications({ type: "special" });
  const items = data?.data ?? [];

  return (
    <PublicPage eyebrow="Publications" title="Special Editions" description="Themed and anniversary issues, printed on heavier stock in limited runs.">
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((pub) => (
            <Link key={pub.id} to="/publications/$slug" params={{ slug: pub.slug }} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md"><PdfThumbnail src={pub.coverImage ?? ''} alt={pub.title} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
              <div className="mt-3"><div className="text-[10px] uppercase tracking-widest text-primary">Special · {pub.title}</div><div className="font-serif text-sm mt-1">{pub.title}</div><div className="text-xs text-muted-foreground mt-1">{formatShortDate(pub.createdAt)}</div></div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
