import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { SectionTitle } from "@/components/ui-primitives";
import { ISSUES } from "@/lib/mock-extended";
import { formatShortDate } from "@/lib/mock-data";

export const Route = createFileRoute("/publications/")({
  head: () => ({ meta: [{ title: "Publications — Swathi Publications" }, { name: "description", content: "Weekly, monthly and special editions from Swathi Publications." }] }),
  component: () => (
    <PublicPage eyebrow="Editorial" title="Publications" description="Our weekly, monthly, and special editions — each a considered artefact of the season.">
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        {[{ to: "/publications/weekly", label: "Swathi Weekly", n: "52 issues/year" },
          { to: "/publications/monthly", label: "Swathi Monthly", n: "12 issues/year" },
          { to: "/publications/special", label: "Special Editions", n: "Curated series" },
          { to: "/publications/digital", label: "Digital Editions", n: "Interactive" }].map((s) => (
          <Link key={s.to} to={s.to as any} className="block border border-rule rounded p-6 bg-paper hover:border-primary">
            <div className="font-serif text-xl">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.n}</div>
          </Link>
        ))}
      </div>
      <SectionTitle eyebrow="Current" title="Latest Issues" href="/publications/archive" hrefLabel="Archive" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {ISSUES.slice(0, 12).map((i) => (
          <Link key={i.id} to="/publications/$slug" params={{ slug: i.slug }} className="group block">
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md"><img src={i.cover} alt={i.title} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-widest text-primary">Issue #{i.number} · {i.series}</div>
              <div className="font-serif text-sm mt-1 leading-snug group-hover:text-primary">{i.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatShortDate(i.date)}</div>
            </div>
          </Link>
        ))}
      </div>
    </PublicPage>
  ),
});
