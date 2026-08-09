import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useContinueReading } from "@/lib/api/hooks";

export const Route = createFileRoute("/library/continue")({
  component: ContinuePage,
});

function ContinuePage() {
  const { data, isLoading } = useContinueReading();
  const books = data?.data ?? [];

  return (
    <PublicPage
      eyebrow="Library"
      title="Continue Reading"
      description="Pick up where you left off."
    >
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-secondary rounded-sm" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Start reading a book and it will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {books.map((b) => (
            <Link key={b.id} to="/reader/$bookId" params={{ bookId: b.id }} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md">
                <img
                  src={b.coverImage ?? ""}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="mt-2 font-serif text-sm">{b.title}</div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
