import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useSubscriptionPlans } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Swathi Publications" }, { name: "description", content: "Subscribe to Swathi Publications. Digital, print, and institutional plans." }] }),
  component: PricingPage,
});

function PricingPage() {
  const { data, isLoading } = useSubscriptionPlans();
  const plans = data?.data ?? [];

  return (
    <SiteLayout>
      <div className="container-edit py-14">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow">Subscribe</div>
          <h1 className="mt-2 font-serif text-5xl">Plans for every reader</h1>
          <p className="mt-3 text-muted-foreground">Independent journalism, funded by readers like you. Cancel anytime.</p>
        </div>

        {isLoading ? (
          <div className="mt-14 grid md:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse border border-rule p-8 h-96"><div className="h-8 bg-secondary rounded w-1/2 mb-4" /><div className="h-12 bg-secondary rounded w-1/3" /></div>)}</div>
        ) : (
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div key={p.id} className={`border p-8 flex flex-col ${i === 1 ? "border-primary shadow-[0_0_0_4px_var(--primary)]/0" : "border-rule"}`}>
                {i === 1 && <div className="eyebrow mb-2">Most Popular</div>}
                <h3 className="font-serif text-2xl">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-serif text-5xl">{formatINR(p.price)}</span>
                  <span className="text-muted-foreground text-sm">/{p.interval}</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm flex-1">
                  {(p.features ?? []).map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {f}</li>)}
                </ul>
                <Link to="/cart" className={`mt-8 text-center py-3 text-sm font-medium ${i === 1 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-input hover:border-primary hover:text-primary"}`}>
                  Subscribe
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 rule-top pt-10">
          <h2 className="font-serif text-3xl">Frequently asked</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            {[
              ["Can I cancel anytime?","Yes. Manage your subscription from My Account. Refunds are prorated for annual plans."],
              ["Do you offer student pricing?","Verified students receive 50% off the Digital plan. Contact support with your institution email."],
              ["What payment methods work?","UPI, all major cards, and net-banking via our PCI-DSS compliant processor."],
              ["Is print available outside India?","Digital only for international readers. Print ships within India."],
            ].map(([q, a]) => (
              <div key={q}>
                <div className="font-semibold">{q}</div>
                <p className="mt-1 text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
