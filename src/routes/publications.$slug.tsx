import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
import { usePublicationBySlug } from "@/lib/api/hooks";
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/publications/$slug")({
  head: () => ({ meta: [{ title: "Publication — Swathi Publications" }] }),
  component: PublicationDetail,
  notFoundComponent: () => <PublicPage title="Issue not found"><Link to="/publications" className="text-primary hover:underline">← All publications</Link></PublicPage>,
});

function PublicationDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = usePublicationBySlug(slug);
  const publication = data?.data;

  if (isLoading) {
    return (
      <PublicPage eyebrow="Loading…" title="">
        <div className="grid md:grid-cols-[300px_1fr] gap-10 animate-pulse">
          <div className="aspect-[3/4] bg-secondary rounded-sm" />
          <div className="space-y-4"><div className="h-6 bg-secondary rounded w-1/2" /><div className="h-4 bg-secondary rounded w-3/4" /><div className="h-20 bg-secondary rounded" /></div>
        </div>
      </PublicPage>
    );
  }

  if (error || !publication) {
    return <PublicPage title="Issue not found"><Link to="/publications" className="text-primary hover:underline">← All publications</Link></PublicPage>;
  }

  return (
    <PublicPage eyebrow={`${publication.type} · ${publication.title}`} title={publication.title} description={formatDate(publication.createdAt)}>
      <div className="grid md:grid-cols-[300px_1fr] gap-10">
        <img src={publication.coverImage ?? ''} alt="" className="rounded-sm shadow-2xl aspect-[3/4] object-cover" />
        <div>
          <p className="font-serif text-lg leading-relaxed">{publication.description || "A considered issue for the season. Long-form reporting, criticism, and columns that reward attention."}</p>
          <div className="mt-6"><Btn><BookOpen className="w-4 h-4 mr-2" />Read Issue</Btn></div>
          <div className="mt-8 pt-6 border-t border-rule">
            <div className="text-xs uppercase text-muted-foreground mb-3">In this issue</div>
            <ul className="space-y-2 text-sm">
              {["The State of the Book", "Notes from the Editor", "Long Read: The Return of the Regional Bookshop", "Portfolio: Print in Practice", "Reviews & Recommendations"].map((t, i) => (
                <li key={i} className="flex justify-between border-b border-rule/50 pb-2"><span>{t}</span><span className="text-muted-foreground">p. {2 + i * 6}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
