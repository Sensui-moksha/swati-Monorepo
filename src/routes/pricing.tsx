import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useSubscriptionPlans } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Swathi Publications" }, { name: "description", content: "Subscribe to Swathi Publications. Digital, print, and institutional plans." }] }),
  component: PricingPage,
});

const DEFAULT_PRICING_PLANS = [
  {
    id: "plan-weekly",
    name: "Swathi Weekly Pass",
    price: 299,
    interval: "month",
    isPopular: false,
    features: [
      "Full digital access to Swathi Weekly",
      "Serials & novel archives access",
      "Exclusive access to Swathi Originals",
      "Cross-device reading sync"
    ]
  },
  {
    id: "plan-monthly",
    name: "Swathi Monthly Pass",
    price: 1999,
    interval: "year",
    isPopular: true,
    features: [
      "Full digital access to Weekly & Monthly editions",
      "Complete back-catalog archive access",
      "Exclusive access to Swathi Originals",
      "Downloadable offline PDF reading",
      "Ad-free digital reading experience"
    ]
  },
  {
    id: "plan-lifetime",
    name: "Swathi Lifetime Pass",
    price: 9999,
    interval: "lifetime",
    isPopular: false,
    features: [
      "Lifetime unlimited digital access",
      "Access to all current & future publications",
      "Exclusive hardcover special publications",
      "Patron badge & direct line to editorial team"
    ]
  }
];



function PricingPage() {
  const { data, isLoading } = useSubscriptionPlans();
  const fetchedPlans = data?.data ?? [];
  const plans = fetchedPlans.length > 0 ? fetchedPlans : DEFAULT_PRICING_PLANS;

  return (
    <SiteLayout>
      <div className="container-edit py-14">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow">Subscribe</div>
          <h1 className="mt-2 font-serif text-5xl">Plans for every reader</h1>
          <p className="mt-3 text-muted-foreground">Digital editions, weekly literature, and exclusive serials. Cancel anytime.</p>
        </div>

        {isLoading && fetchedPlans.length === 0 ? (
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-rule p-8 h-96 rounded-2xl bg-paper">
                <div className="h-8 bg-secondary rounded w-1/2 mb-4" />
                <div className="h-12 bg-secondary rounded w-1/3 mb-6" />
                <div className="space-y-3">
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="h-4 bg-secondary rounded w-5/6" />
                  <div className="h-4 bg-secondary rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((p) => {
              const isPopular = Boolean((p as any).isPopular);
              return (
                <div
                  key={p.id}
                  className={`relative p-8 flex flex-col rounded-2xl bg-paper transition-all duration-300 ${
                    isPopular
                      ? "border-2 border-primary shadow-xl scale-[1.02] z-10"
                      : "border border-rule shadow-sm hover:shadow-md"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <h3 className="font-serif text-2xl font-bold">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-serif text-5xl font-bold">{formatINR(p.price)}</span>
                    <span className="text-muted-foreground text-sm">/{p.interval}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm flex-1">
                    {((p.features && p.features.length > 0)
                      ? p.features
                      : [
                          "Full Swathi Weekly digital editions",
                          "Access to serials & novel archive",
                          "Exclusive access to Swathi Originals & special curations",
                          "Cross-device reading sync"
                        ]
                    ).map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/cart"
                    className={`mt-8 text-center py-3 text-sm font-medium rounded-lg transition-colors ${
                      isPopular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold"
                        : "border border-input hover:border-primary hover:text-primary"
                    }`}
                  >
                    Subscribe Now
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-20 rule-top pt-10">
          <h2 className="font-serif text-3xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            {[
              ["Can I cancel anytime?", "Yes. Manage your subscription from My Account. Cancel anytime with zero fees."],
              ["What payment methods work?", "UPI, GPay, Paytm, all major credit/debit cards, and net-banking."],
              ["How do I access digital editions?", "Read instantly on web using our inbuilt high-resolution PDF flipbook reader."],
              ["Can I switch plans later?", "Yes, you can upgrade or downgrade your plan anytime from your user dashboard."],
            ].map(([q, a]) => (
              <div key={q} className="space-y-1">
                <div className="font-semibold text-base">{q}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
