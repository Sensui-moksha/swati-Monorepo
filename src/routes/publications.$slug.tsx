import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
import { ISSUES } from "@/lib/mock-extended";
import { formatDate } from "@/lib/mock-data";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/publications/$slug")({
  loader: ({ params }) => {
    const issue = ISSUES.find((i) => i.slug === params.slug);
    if (!issue) throw notFound();
    return { issue };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `Issue #${loaderData.issue.number} — ${loaderData.issue.title}` : "Issue" }] }),
  component: () => {
    const { issue } = Route.useLoaderData();
    return (
      <PublicPage eyebrow={`${issue.series} · Issue #${issue.number}`} title={issue.title} description={formatDate(issue.date)}>
        <div className="grid md:grid-cols-[300px_1fr] gap-10">
          <img src={issue.cover} alt="" className="rounded-sm shadow-2xl aspect-[3/4] object-cover" />
          <div>
            <p className="font-serif text-lg leading-relaxed">A considered issue for the season. Long-form reporting, criticism, and columns that reward attention.</p>
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
  },
  notFoundComponent: () => <PublicPage title="Issue not found"><Link to="/publications" className="text-primary hover:underline">← All publications</Link></PublicPage>,
});
