import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Swathi Publications" }, { name: "description", content: "The story of Swathi Publications." }] }),
  component: () => (
    <SiteLayout>
      <div className="container-edit py-14 max-w-3xl">
        <div className="eyebrow">About</div>
        <h1 className="mt-2 font-serif text-5xl">A newsroom, patiently built.</h1>
        <div className="mt-8 font-serif text-lg leading-[1.85] space-y-6 text-foreground/90">
          <p className="first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85]">
            Swathi Publications was founded in Chennai in 1998 with a small typesetting machine, a rented office above a chemist's shop, and a stubborn belief that readers deserved reporting that took its time.
          </p>
          <p>Nearly three decades on, we publish daily online, a weekly print edition, and a growing library of investigations and long-form essays. Our newsroom is small on purpose. Our readers, we hope, are for life.</p>
          <p>We are independent, reader-funded, and answerable to no advertiser. Everything we publish is edited by a human being who has read it more than once.</p>
        </div>

        <div className="rule-top mt-12 pt-10 grid sm:grid-cols-3 gap-6">
          {[["1998","Founded"],["48+","Editors & correspondents"],["2M+","Monthly readers"]].map(([n,l]) => (
            <div key={l}><div className="font-serif text-4xl text-primary">{n}</div><div className="text-sm text-muted-foreground mt-1">{l}</div></div>
          ))}
        </div>
      </div>
    </SiteLayout>
  ),
});
