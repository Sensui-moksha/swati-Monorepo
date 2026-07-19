import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { PUBLISHERS } from "@/lib/mock-extended";

export const Route = createFileRoute("/publishers/")({
  head: () => ({ meta: [{ title: "Publishers — Swathi Publications" }] }),
  component: () => (
    <PublicPage eyebrow="Directory" title="Publishers" description="Imprints and partner publishing houses.">
      <div className="grid md:grid-cols-3 gap-6">
        {PUBLISHERS.map((p) => (
          <Link key={p.slug} to="/publishers/$slug" params={{ slug: p.slug }} className="block bg-paper border border-rule rounded p-6 hover:border-primary transition">
            <div className="font-serif text-xl">{p.name}</div>
            <div className="text-xs uppercase tracking-widest text-primary mt-1">Est. {p.founded} · {p.location}</div>
            <div className="text-sm text-muted-foreground mt-4">{p.titles} titles in print</div>
          </Link>
        ))}
      </div>
    </PublicPage>
  ),
});
