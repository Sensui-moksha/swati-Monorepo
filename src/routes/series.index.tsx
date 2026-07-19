import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { SERIES } from "@/lib/mock-extended";

export const Route = createFileRoute("/series/")({
  component: () => (
    <PublicPage eyebrow="Browse" title="Series" description="Multi-volume works we publish, from textbook series to academic monographs.">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERIES.map((s) => (
          <Link key={s.slug} to="/series/$slug" params={{ slug: s.slug }} className="group block">
            <div className="aspect-[3/4] rounded-sm shadow-md overflow-hidden"><img src={s.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
            <div className="mt-3"><div className="font-serif text-lg">{s.name}</div><div className="text-xs text-muted-foreground mt-1">{s.volumes} volumes</div></div>
          </Link>
        ))}
      </div>
    </PublicPage>
  ),
});
