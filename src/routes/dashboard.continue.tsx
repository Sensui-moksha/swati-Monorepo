import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader } from "@/components/ui-primitives";
import { useContinueReading } from "@/lib/api/hooks";

export const Route = createFileRoute("/dashboard/continue")({
  component: ContinuePage,
});

function ContinuePage() {
  const { data, isLoading } = useContinueReading();
  const books = data?.data ?? [];

  return (
    <DashboardShell>
      <PageHeader eyebrow="Dashboard" title="Continue Reading" description="Pick up where you left off." />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-secondary rounded-sm" /></div>)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {books.map((b) => (
            <Link key={b.id} to="/reader/$bookId" params={{ bookId: b.id }} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md"><img src={b.coverImage ?? ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
              <div className="mt-2 font-serif text-sm">{b.title}</div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
