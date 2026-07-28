import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
import { usePublicationBySlug, useIssues } from "@/lib/api/hooks";
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { PdfBookViewer } from "@/components/PdfBookViewer";
import { PdfThumbnail } from "@/components/PdfThumbnail";
import { useState } from "react";

export const Route = createFileRoute("/publications/$slug")({
  head: () => ({ meta: [{ title: "Publication — Swathi Publications" }] }),
  component: PublicationDetail,
  notFoundComponent: () => <PublicPage title="Issue not found"><Link to="/publications" className="text-primary hover:underline">← All publications</Link></PublicPage>,
});

function PublicationDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = usePublicationBySlug(slug);
  const publication = data?.data;
  const [isBookViewerOpen, setIsBookViewerOpen] = useState(false);

  const { data: issuesData, isLoading: isLoadingIssues } = useIssues(
    publication?.id as string, 
    { limit: 10 }
  );
  const issues = (publication?.id && issuesData?.data) ? issuesData.data : [];

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

  const pdfUrl = (publication as any).pdfUrl || "/documents/EDITOR GARI SANMANAPATRAM.pdf";
  const coverSrc = publication.coverImage ?? pdfUrl;

  return (
    <PublicPage eyebrow={`${publication.type} · ${publication.title}`} title={publication.title} description={formatDate(publication.createdAt)}>
      <div className="grid md:grid-cols-[300px_1fr] gap-10 mb-12">
        {/* Cover — renders PDF page 1 as canvas if coverImage is a .pdf path */}
        <PdfThumbnail src={coverSrc} alt={publication.title} className="rounded-sm shadow-2xl aspect-[3/4] object-cover" />

        <div>
          <p className="font-serif text-lg leading-relaxed">{publication.description || "A considered issue for the season."}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Btn onClick={() => setIsBookViewerOpen(true)} className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Read in Book Viewer
            </Btn>
          </div>

          <div className="mt-8 pt-6 border-t border-rule">
            <div className="text-xs uppercase text-muted-foreground mb-3">In this issue</div>
            {isLoadingIssues ? (
              <div className="space-y-2 text-sm animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="h-6 bg-secondary rounded w-full" />
                ))}
              </div>
            ) : issues.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {issues.map((issue: any) => (
                  <li key={issue.id} className="flex justify-between border-b border-rule/50 pb-2"><span>{issue.title}</span><span className="text-muted-foreground">Vol. {issue.volume} No. {issue.number}</span></li>
                ))}
              </ul>
            ) : (
              <div className="text-sm opacity-60 text-muted-foreground">Swathi PDF document — open the Book Viewer for interactive reading.</div>
            )}
          </div>
        </div>
      </div>

      <PdfBookViewer
        isOpen={isBookViewerOpen}
        onClose={() => setIsBookViewerOpen(false)}
        title={publication.title}
        pdfUrl={pdfUrl}
      />
    </PublicPage>
  );
}
