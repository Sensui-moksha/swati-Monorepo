import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill, KpiCard, Card } from "@/components/ui-primitives";
export const Route = createFileRoute("/admin/publications")({
  component: () => (
    <AdminShell>
      <PageHeader eyebrow="Admin" title="Publications" description="Weeklies, monthlies, specials and digital editions." actions={<Btn>New</Btn>} />
      <div className="flex flex-wrap gap-2 mb-6">
        <input placeholder="Search…" className="border border-rule bg-paper rounded px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select className="border border-rule bg-paper rounded px-3 py-2 text-sm"><option>All statuses</option><option>Active</option><option>Draft</option><option>Archived</option></select>
        <Btn variant="outline">Export CSV</Btn>
      </div>
      <div className="bg-paper border border-rule rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>{["Name","Status","Owner","Updated",""].map((h)=>(<th key={h} className="text-left px-4 py-3 font-medium">{h}</th>))}</tr>
          </thead>
          <tbody>
            {Array.from({length:12}).map((_,i)=>(
              <tr key={i} className="border-t border-rule/50 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">Publications record #{1000+i}</td>
                <td className="px-4 py-3"><StatusPill status={["Active","Draft","Archived","Active"][i%4]} /></td>
                <td className="px-4 py-3 text-muted-foreground">{["R. Iyer","M. Sundaram","N. Ravi","S. Krishnan"][i%4]}</td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">2026-07-{String(13-(i%13)).padStart(2,'0')}</td>
                <td className="px-4 py-3 text-right"><Btn size="sm" variant="outline">Edit</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
          <span>Showing 1–12 of 248</span>
          <div className="flex gap-1"><Btn size="sm" variant="outline">Prev</Btn><Btn size="sm" variant="outline">Next</Btn></div>
        </div>
      </div>
    </AdminShell>
  ),
});
