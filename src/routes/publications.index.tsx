import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { SectionTitle } from "@/components/ui-primitives";
import { usePublications } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { PdfThumbnail } from "@/components/PdfThumbnail";

export const Route = createFileRoute("/publications/")({
  head: () => ({ meta: [{ title: "Publications — Swathi Publications" }, { name: "description", content: "Weekly, monthly and special editions from Swathi Publications." }] }),
  component: PublicationsIndex,
});

function PublicationsIndex() {
  const { data, isLoading } = usePublications();
  const publications = data?.data ?? [];

  return (
    <PublicPage eyebrow="Editorial" title="Publications" description="Our weekly, monthly, and originals editions — curated literature and journalism.">
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {[{ to: "/publications/weekly", label: "Swathi Weekly", n: "52 issues/year" },
          { to: "/publications/monthly", label: "Swathi Monthly", n: "12 issues/year" },
          { to: "/publications/special", label: "Swathi Originals", n: "Curated series & novels" }].map((s) => (
          <Link key={s.to} to={s.to as any} className="block border border-rule rounded p-6 bg-paper hover:border-primary">
            <div className="font-serif text-xl">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.n}</div>
          </Link>
        ))}
      </div>
      <SectionTitle eyebrow="Current" title="Latest Issues" href="/publications/archive" hrefLabel="Archive" />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-secondary rounded-sm" />
              <div className="mt-3 h-3 bg-secondary rounded w-2/3" />
              <div className="mt-2 h-3 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {publications.slice(0, 12).map((pub) => (
            <Link key={pub.id} to="/publications/$slug" params={{ slug: pub.slug }} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md">
                <PdfThumbnail src={pub.coverImage ?? ''} alt={pub.title} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-widest text-primary">{pub.type} · {pub.issueCount} issues</div>
                <div className="font-serif text-sm mt-1 leading-snug group-hover:text-primary">{pub.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{formatShortDate(pub.createdAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
