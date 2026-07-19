import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { ISSUES } from "@/lib/mock-extended";
import { formatShortDate } from "@/lib/mock-data";

export const Route = createFileRoute("/publications/special")({
  component: () => (
    <PublicPage eyebrow="Publications" title="Special Editions" description="Themed and anniversary issues, printed on heavier stock in limited runs.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {ISSUES.filter((i) => i.series === "special").map((i) => (
          <Link key={i.id} to="/publications/$slug" params={{ slug: i.slug }} className="group block">
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md"><img src={i.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
            <div className="mt-3"><div className="text-[10px] uppercase tracking-widest text-primary">Special #{i.number}</div><div className="font-serif text-sm mt-1">{i.title}</div><div className="text-xs text-muted-foreground mt-1">{formatShortDate(i.date)}</div></div>
          </Link>
        ))}
      </div>
    </PublicPage>
  ),
});
