import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
import { GENRES, TAGS } from "@/lib/mock-extended";
export const Route = createFileRoute("/discover/filters")({
  component: () => (
    <PublicPage eyebrow="Discover" title="Advanced Filters" description="Narrow the catalogue by every field we track.">
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
        {[["Genre", GENRES.map((g) => g.name)],
          ["Tag", TAGS],
          ["Language", ["English","Hindi","Telugu","Tamil","Kannada","Malayalam"]],
          ["Year", ["2026","2025","2024","2023","Earlier"]],
          ["Format", ["Hardcover","Softcover","Digital only","Print + Digital"]],
          ["Price", ["Under ₹300","₹300–₹600","₹600–₹1000","Above ₹1000"]]].map(([label, options]) => (
          <div key={label as string}><div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label as string}</div>
            <div className="flex flex-wrap gap-2">{(options as string[]).map((o) => <label key={o} className="text-sm border border-rule px-3 py-1 rounded-full cursor-pointer hover:bg-secondary"><input type="checkbox" className="mr-2" />{o}</label>)}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-3"><Btn>Apply filters</Btn><Btn variant="outline">Save search</Btn></div>
    </PublicPage>
  ),
});
