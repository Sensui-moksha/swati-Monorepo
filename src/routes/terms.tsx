import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Swathi Publications" }] }),
  component: () => (
    <PublicPage eyebrow="Legal" title="Terms & Conditions" description="The terms that govern your use of Swathi Publications.">
      <div className="prose prose-neutral max-w-3xl font-serif space-y-4">
        <p>By accessing or using Swathi Publications, you agree to be bound by these terms.</p>
        <h2 className="font-serif text-2xl mt-8">Use of the service</h2>
        <p>Content is provided for personal, non-commercial reading. Redistribution of subscription content is prohibited.</p>
        <h2 className="font-serif text-2xl mt-8">Subscriptions and billing</h2>
        <p>Subscriptions auto-renew until cancelled. You may cancel at any time from your account.</p>
        <h2 className="font-serif text-2xl mt-8">Intellectual property</h2>
        <p>All content is © Swathi Publications and its contributors unless otherwise noted.</p>
        <p className="text-muted-foreground text-sm mt-8">Last updated: July 2026.</p>
      </div>
    </PublicPage>
  ),
});
