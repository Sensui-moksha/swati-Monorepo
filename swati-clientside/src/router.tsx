import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PendingPage } from "./components/pending";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes cache
        gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 10 * 60 * 1000,
    defaultPreload: "intent",
    defaultPendingComponent: PendingPage,
    defaultPendingMs: 150,
    defaultPendingMinMs: 200,
  });

  return router;
};
