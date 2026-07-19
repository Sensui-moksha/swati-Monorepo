import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { AUTHORS } from "@/lib/mock-extended";

export const Route = createFileRoute("/authors/")({
  head: () => ({ meta: [{ title: "Authors — Swathi Publications" }] }),
  component: () => (
    <PublicPage eyebrow="People" title="Authors" description="The writers, scholars, and practitioners whose work we bring to print.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AUTHORS.map((a) => (
          <Link key={a.slug} to="/authors/$slug" params={{ slug: a.slug }} className="block bg-paper border border-rule rounded p-6 hover:border-primary transition">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary grid place-items-center font-serif text-xl">{a.name[0]}</div>
              <div className="min-w-0"><div className="font-serif text-lg leading-tight">{a.name}</div><div className="text-xs text-primary uppercase tracking-widest mt-1">{a.role}</div></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 line-clamp-3">{a.bio}</p>
            <div className="mt-4 text-xs text-muted-foreground flex gap-4"><span>{a.books} books</span><span>{a.followers.toLocaleString()} followers</span></div>
          </Link>
        ))}
      </div>
    </PublicPage>
  ),
});
