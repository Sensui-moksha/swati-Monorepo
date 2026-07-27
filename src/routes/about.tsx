import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Swathi Publications" }, { name: "description", content: "The story of Swathi Publications." }] }),
  component: () => (
    <SiteLayout>
      <div className="container-edit py-14 max-w-6xl">
        <div className="eyebrow">About</div>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl lg:text-6xl font-bold">A newsroom, patiently built.</h1>

        <div className="mt-10 grid md:grid-cols-12 gap-12 items-start">
          {/* Left Column: Story & Metrics */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            <div className="font-serif text-lg md:text-xl leading-[1.85] space-y-6 text-foreground/90">
              <p className="first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85]">
                Swathi Publications was founded in Chennai in 1998 with a small typesetting machine, a rented office above a chemist's shop, and a stubborn belief that readers deserved reporting that took its time.
              </p>
              <p>Nearly three decades on, we publish daily online, a weekly print edition, and a growing library of investigations and long-form essays. Our newsroom is small on purpose. Our readers, we hope, are for life.</p>
              <p>We are independent, reader-funded, and answerable to no advertiser. Everything we publish is edited by a human being who has read it more than once.</p>
            </div>

            <div className="rule-top pt-8 grid grid-cols-3 gap-6">
              {[["1998","Founded"],["48+","Editors & correspondents"],["2M+","Monthly readers"]].map(([n,l]) => (
                <div key={l}>
                  <div className="font-serif text-3xl md:text-4xl text-primary font-bold">{n}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Single Featured Image Card with Name Below */}
          <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-24">
            <div className="eyebrow mb-3">Editorial Leadership</div>
            <Link
              to="/authors/$slug"
              params={{ slug: "dr-swathi-ramachandran" }}
              className="group block text-center bg-paper border border-rule rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-primary transition-all duration-300"
            >
              {/* Single Image */}
              <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-secondary border border-rule">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
                  alt="Dr. Swathi Ramachandran"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Name directly below image */}
              <h3 className="mt-4 font-serif text-2xl font-bold group-hover:text-primary transition-colors">
                Dr. Swathi Ramachandran
              </h3>
              <div className="mt-1 text-xs text-primary font-semibold uppercase tracking-widest">
                Founder & Editor-in-Chief
              </div>
              <p className="mt-2 text-xs text-muted-foreground px-2 leading-relaxed">
                Ph.D. in Constitutional Law. Lead editor at Swathi Publications since 1998.
              </p>

              <div className="mt-4 pt-3 border-t border-rule/60 inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline">
                <BookOpen className="h-3.5 w-3.5" /> View Profile & Inbuilt PDF <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  ),
});
