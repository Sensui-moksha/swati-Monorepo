import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { EmptyState, Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/discover/saved-searches")({
  component: () => (
    <PublicPage eyebrow="Discover" title="Saved Searches" description="Searches you've bookmarked.">
      <ul className="max-w-2xl divide-y divide-rule border border-rule rounded">
        {[{ q: "Indian polity 2024", n: 12 }, { q: "Physics + monograph", n: 4 }, { q: "Medical reference, hardcover", n: 8 }].map((s) => (
          <li key={s.q} className="flex items-center justify-between p-4 bg-paper">
            <div><div className="font-medium">{s.q}</div><div className="text-xs text-muted-foreground">{s.n} results</div></div>
            <div className="flex gap-2"><Btn variant="outline">Run</Btn><Btn variant="ghost">Delete</Btn></div>
          </li>
        ))}
      </ul>
    </PublicPage>
  ),
});
