import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { usePublications } from "@/lib/api/hooks";
import { formatDate } from "@/lib/utils";
import { PdfThumbnail } from "@/components/PdfThumbnail";

export const Route = createFileRoute("/publications/archive")({
  component: ArchivePage,
});

function ArchivePage() {
  const { data, isLoading } = usePublications();
  const items = data?.data ?? [];

  return (
    <PublicPage
      eyebrow="Publications"
      title="Publication Archive"
      description="Every issue we've ever put to press, searchable by date and series."
      backTo="/publications"
      backLabel="Back to Publications"
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground border-b border-rule">
              <tr>
                <th className="text-left py-3 w-16">Cover</th>
                <th className="text-left py-3">Publication</th>
                <th className="text-left">Type</th>
                <th className="text-left">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((pub) => (
                <tr key={pub.id} className="border-b border-rule/60">
                  <td className="py-3">
                    {pub.coverImage ? (
                      <PdfThumbnail
                        src={pub.coverImage}
                        alt={pub.title}
                        className="w-12 h-16 rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center border">
                        <span className="text-[10px] text-muted-foreground">No cover</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 font-medium">{pub.title}</td>
                  <td className="capitalize text-muted-foreground">{pub.type}</td>
                  <td className="text-muted-foreground">{formatDate(pub.createdAt)}</td>
                  <td className="text-right">
                    <Link
                      to="/publications/$slug"
                      params={{ slug: pub.slug }}
                      className="text-primary hover:underline text-xs"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PublicPage>
  );
}
