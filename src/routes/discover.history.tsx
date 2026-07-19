import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
export const Route = createFileRoute("/discover/history")({
  component: () => (
    <PublicPage eyebrow="Discover" title="Search History" description="Everything you've searched for recently.">
      <ul className="max-w-2xl divide-y divide-rule border border-rule rounded">
        {["indian polity","constitution amendments","physics textbook","kavita rao history","cbse english","medical anatomy","exam prep math"].map((q) => (
          <li key={q} className="flex items-center justify-between p-4 bg-paper text-sm"><span>{q}</span><span className="text-xs text-muted-foreground">2 days ago</span></li>
        ))}
      </ul>
    </PublicPage>
  ),
});
