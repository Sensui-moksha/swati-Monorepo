import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { ISSUES } from "@/lib/mock-extended";
import { formatShortDate } from "@/lib/mock-data";

function IssueGrid({ series, title, description }: { series: "weekly" | "monthly" | "special"; title: string; description: string }) {
  const items = ISSUES.filter((i) => i.series === series);
  return (
    <PublicPage eyebrow="Publications" title={title} description={description}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {items.map((i) => (
          <Link key={i.id} to="/publications/$slug" params={{ slug: i.slug }} className="group block">
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md"><img src={i.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-widest text-primary">Issue #{i.number}</div>
              <div className="font-serif text-sm mt-1 leading-snug group-hover:text-primary">{i.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatShortDate(i.date)}</div>
            </div>
          </Link>
        ))}
      </div>
    </PublicPage>
  );
}

export const Route = createFileRoute("/publications/weekly")({
  component: () => <IssueGrid series="weekly" title="Swathi Weekly" description="A weekly digest of long-form reporting, criticism, and column writing." />,
});
