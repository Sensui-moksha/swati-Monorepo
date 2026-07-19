import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Swathi Publications" }] }),
  component: () => (
    <PublicPage eyebrow="Legal" title="Privacy Policy" description="How we collect, use, and protect your data.">
      <div className="prose prose-neutral max-w-3xl font-serif space-y-4">
        <p>Swathi Publications collects only the data necessary to deliver our editorial products. We do not sell personal data to third parties.</p>
        <h2 className="font-serif text-2xl mt-8">Information we collect</h2>
        <p>Name and email address, reading history within our platform, and payment information processed by our payment provider.</p>
        <h2 className="font-serif text-2xl mt-8">How we use it</h2>
        <p>To deliver your subscription, personalise recommendations, and communicate essential service updates.</p>
        <h2 className="font-serif text-2xl mt-8">Your rights</h2>
        <p>You may request access, correction, or deletion of your data at any time from your account settings.</p>
        <p className="text-muted-foreground text-sm mt-8">Last updated: July 2026.</p>
      </div>
    </PublicPage>
  ),
});
