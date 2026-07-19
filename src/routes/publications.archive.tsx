import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { ISSUES } from "@/lib/mock-extended";
import { formatDate } from "@/lib/mock-data";

export const Route = createFileRoute("/publications/archive")({
  component: () => (
    <PublicPage eyebrow="Publications" title="Publication Archive" description="Every issue we've ever put to press, searchable by date and series.">
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b border-rule"><tr><th className="text-left py-3">Issue</th><th className="text-left">Series</th><th className="text-left">Date</th><th></th></tr></thead>
        <tbody>{ISSUES.map((i) => (
          <tr key={i.id} className="border-b border-rule/60"><td className="py-3">#{i.number} — {i.title}</td><td className="capitalize text-muted-foreground">{i.series}</td><td className="text-muted-foreground">{formatDate(i.date)}</td><td className="text-right"><Link to="/publications/$slug" params={{ slug: i.slug }} className="text-primary hover:underline text-xs">Open →</Link></td></tr>
        ))}</tbody>
      </table></div>
    </PublicPage>
  ),
});
