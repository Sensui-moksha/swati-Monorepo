import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";

const FAQS = [
  { q: "What subscription plans do you offer?", a: "We offer Digital, Digital + Print, and Institutional plans. See the pricing page for details." },
  { q: "Can I read on multiple devices?", a: "Yes. Your subscription covers up to five devices on a single account." },
  { q: "How do I access print editions?", a: "Digital + Print subscribers receive print copies by post. Institutional plans include home and office delivery." },
  { q: "Are back issues available?", a: "Every issue we've ever published is available in the digital archive." },
  { q: "What is your refund policy?", a: "Cancel within 14 days of purchase for a full refund. After that, refunds are prorated." },
  { q: "How do I request an institutional trial?", a: "Contact our sales team through the contact page. Trials run for 30 days." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "Frequently Asked Questions — Swathi Publications" }] }),
  component: () => (
    <PublicPage eyebrow="Help" title="Frequently Asked Questions" description="Answers to common questions about subscriptions, delivery, and access.">
      <div className="max-w-3xl space-y-4">
        {FAQS.map((f, i) => (
          <details key={i} className="group border-b border-rule py-4">
            <summary className="cursor-pointer font-serif text-lg flex justify-between items-center list-none">
              <span>{f.q}</span><span className="text-primary group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </PublicPage>
  ),
});
