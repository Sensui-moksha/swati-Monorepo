import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { useSearchHistory } from "@/lib/api/hooks";

export const Route = createFileRoute("/discover/history")({
  component: Page,
});

function Page() {
  const { data: historyData, isLoading } = useSearchHistory();
  const history = historyData?.data || [];

  return (
    <PublicPage
      eyebrow="Discover"
      title="Search History"
      description="Everything you've searched for recently."
    >
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading history...
        </div>
      ) : (
        <ul className="max-w-2xl divide-y divide-rule border border-rule rounded">
          {history.length === 0 ? (
            <li className="p-8 text-center text-muted-foreground">No search history</li>
          ) : (
            history.map((item: any, idx: number) => (
              <li key={idx} className="flex items-center justify-between p-4 bg-paper text-sm">
                <span>{item.query}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </PublicPage>
  );
}
