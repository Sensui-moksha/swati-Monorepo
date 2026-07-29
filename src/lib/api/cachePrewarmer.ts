import type { QueryClient } from "@tanstack/react-query";
import { articlesApi } from "./endpoints/articles";
import { queryKeys } from "./queryKeys";

/**
 * Pre-warms the TanStack Query cache & PDF worker in the background while the user reads or navigates.
 * Executed during browser idle time to ensure instant, zero-delay route switches.
 */
export function prewarmAppCache(queryClient: QueryClient): void {
  if (typeof window === "undefined") return;

  const schedule =
    typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 200);

  schedule(() => {
    // 1. Prefetch main articles list
    queryClient.prefetchQuery({
      queryKey: queryKeys.articles.list(),
      queryFn: () => articlesApi.list(),
    }).catch(() => {});

    // 2. Prefetch categories list
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => articlesApi.listCategories(),
    }).catch(() => {});

    // 3. Prefetch featured articles
    queryClient.prefetchQuery({
      queryKey: queryKeys.articles.featured(),
      queryFn: () => articlesApi.getFeatured(5),
    }).catch(() => {});

    // 4. Prefetch latest stories
    queryClient.prefetchQuery({
      queryKey: queryKeys.articles.latest({ limit: 5 }),
      queryFn: () => articlesApi.getLatest({ limit: 5 }),
    }).catch(() => {});

    // 5. Pre-warm PDF viewer & default PDF document in background
    import("@/components/PdfBookViewer")
      .then(({ getPdfDocument }) => {
        getPdfDocument("/documents/EDITOR GARI SANMANAPATRAM.pdf").catch(() => {});
        getPdfDocument("/documents/sample-issue.pdf").catch(() => {});
      })
      .catch(() => {});
  });
}
