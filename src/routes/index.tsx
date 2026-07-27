import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useFeaturedArticles, useArticles, useLatestArticles, useTrendingArticles, useTopStories, useCategories } from "@/lib/api/hooks";
import { formatDate, formatShortDate } from "@/lib/utils";
import { ArrowRight, BookOpen, ShieldCheck, Sparkles, Newspaper, TrendingUp, Check } from "lucide-react";

const TESTIMONIALS = [
  { name: "Dr. Meera Sundaram", role: "Professor, JNU", quote: "The kind of reporting that assumes its reader is intelligent. A rare thing." },
  { name: "Arjun Kapoor", role: "Founder, LedgerLabs", quote: "My morning read. Long-form when it earns it, brisk when it doesn't." },
  { name: "Shreya Nair", role: "Public Policy Analyst", quote: "Sober analysis without the theatrics of the news cycle." },
];

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: featuredData } = useFeaturedArticles(1);
  const { data: topStoriesData } = useTopStories();
  const { data: categoriesData } = useCategories();
  const { data: articlesData } = useArticles({ limit: 3 });
  const { data: latestData } = useLatestArticles({ limit: 5 });
  const { data: trendingData } = useTrendingArticles({ limit: 5 });

  const featured = featuredData?.data?.[0];
  const topStories = topStoriesData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const articles = articlesData?.data ?? [];
  const latest = latestData?.data ?? [];
  const trending = trendingData?.data ?? [];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="container-edit pt-10 pb-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            {featured ? (
              <Link to="/articles/$slug" params={{ slug: featured.slug }} className="group block">
                <div className="overflow-hidden bg-secondary">
                  <img src={featured.coverImage ?? ''} alt={featured.title} className="aspect-[16/9] w-full object-cover" />
                </div>
                <div className="mt-5 flex items-center gap-3 text-xs">
                  <span className="eyebrow">{featured.category?.name ?? 'Featured'}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{featured.publishedAt ? formatDate(featured.publishedAt) : ''} · {featured.readingTime} min read</span>
                </div>
                <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.05] tracking-tight group-hover:text-primary transition-colors">
                  {featured.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Read the story <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ) : (
              <div className="animate-pulse"><div className="aspect-[16/9] bg-secondary" /><div className="mt-5 h-12 bg-secondary rounded w-3/4" /><div className="mt-4 h-6 bg-secondary rounded w-1/2" /></div>
            )}
          </div>

          <aside className="md:col-span-4 md:border-l md:border-rule md:pl-8">
            <div className="eyebrow mb-4">Top Stories</div>
            <ul className="divide-y divide-rule">
              {topStories.slice(0, 4).map((a, i) => (
                <li key={a.id} className="py-4 first:pt-0">
                  <Link to="/articles/$slug" params={{ slug: a.slug }} className="group flex gap-4">
                    <span className="font-serif text-3xl text-primary/70 leading-none w-6">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{a.category?.name ?? 'Article'}</div>
                      <h3 className="mt-1 font-serif text-lg leading-snug group-hover:text-primary">{a.title}</h3>
                      <div className="mt-1 text-xs text-muted-foreground">{a.publishedAt ? formatShortDate(a.publishedAt) : ''} · {a.readingTime} min read</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Categories */}
      <section className="rule-top bg-secondary/40">
        <div className="container-edit py-14">
          <SectionHead eyebrow="Sections" title="Explore by category" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-px bg-rule border border-rule">
            {categories.map((c) => (
              <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="group bg-paper p-6 hover:bg-secondary transition-colors">
                <div className="text-2xl font-serif font-semibold group-hover:text-primary">{c.name}</div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary uppercase tracking-wider">
                  Read <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured publications */}
      <section className="container-edit py-16">
        <div className="flex items-end justify-between">
          <SectionHead eyebrow="Featured" title="This week's essential reads" />
          <Link to="/articles" className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:underline">
            All publications <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-8">
          {articles.map((a) => (
            <article key={a.id} className="group">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={a.coverImage ?? ''} alt={a.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  {(a as any).isPremium && (
                    <span className="absolute left-3 top-3 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-widest px-2 py-1">
                      Premium
                    </span>
                  )}
                </div>
                <div className="mt-4 eyebrow">{a.category?.name ?? 'Article'}</div>
                <h3 className="mt-2 font-serif text-2xl leading-tight group-hover:text-primary">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                <div className="mt-3 text-xs text-muted-foreground">By {a.author?.name ?? 'Staff'} · {a.publishedAt ? formatShortDate(a.publishedAt) : ''}</div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Latest — editorial list */}
      <section className="rule-top bg-paper">
        <div className="container-edit py-16">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-8">
              <SectionHead eyebrow="Latest" title="Fresh from the newsroom" />
              <ul className="mt-8 divide-y divide-rule">
                {latest.map((a) => (
                  <li key={a.id} className="py-6">
                    <Link to="/articles/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[100px_minmax(0,1fr)] sm:grid-cols-[140px_minmax(0,1fr)] gap-5">
                      <img src={a.coverImage ?? ''} alt={a.title} className="aspect-[4/3] w-full object-cover bg-secondary" />
                      <div className="min-w-0">
                        <div className="eyebrow">{a.category?.name ?? 'Article'}</div>
                        <h3 className="mt-1 font-serif text-lg sm:text-xl leading-snug group-hover:text-primary">{a.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                        <div className="mt-2 text-xs text-muted-foreground">{a.publishedAt ? formatShortDate(a.publishedAt) : ''} · {a.readingTime} min read</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/latest" className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:border-primary hover:text-primary">
                  More latest stories <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <aside className="md:col-span-4 md:border-l md:border-rule md:pl-8">
              <div className="eyebrow mb-4 flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Trending</div>
              <ol className="space-y-4">
                {trending.map((a, i) => (
                  <li key={a.id}>
                    <Link to="/articles/$slug" params={{ slug: a.slug }} className="group flex gap-3">
                      <span className="font-serif text-2xl text-primary/60 leading-none w-6">{i + 1}</span>
                      <span className="font-serif text-base leading-snug group-hover:text-primary">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>



      {/* Subscription */}
      <section className="container-edit py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="eyebrow flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Premium Membership</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">Support independent journalism.</h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              A Swathi subscription funds original reporting, deep investigations, and a print edition that still lands on doorsteps every Sunday.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Unlimited access to premium articles", "The weekly print edition, delivered", "Full archive since 1998", "Exclusive editor briefings"].map((b) => (
                <li key={b} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {b}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/pricing" className="bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90">Subscribe from ₹199/mo</Link>
              <Link to="/pricing" className="text-sm text-primary hover:underline">Compare plans →</Link>
            </div>
          </div>
          <div className="relative border border-rule p-8 bg-secondary/40">
            <div className="eyebrow">Featured Plan</div>
            <div className="mt-2 font-serif text-3xl">Digital + Print</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-serif text-6xl">₹449</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Billed monthly. Cancel anytime.</div>
            <div className="rule-top mt-6 pt-6 space-y-2 text-sm">
              {["Everything in Digital", "Weekly print edition", "Home delivery across India", "Full archive access"].map((b) => (
                <div key={b} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> {b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="rule-top bg-paper">
        <div className="container-edit py-16">
          <SectionHead eyebrow="Readers" title="What our subscribers say" center />
          <div className="mt-12 grid md:grid-cols-3 gap-10">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="border-l-2 border-primary pl-6">
                <blockquote className="font-serif text-xl leading-snug">"{t.quote}"</blockquote>
                <figcaption className="mt-4 text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-muted-foreground">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHead({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-2 font-serif text-3xl md:text-4xl">{title}</h2>
      <div className={`mt-3 h-0.5 w-16 bg-primary ${center ? "mx-auto" : ""}`} />
    </div>
  );
}
