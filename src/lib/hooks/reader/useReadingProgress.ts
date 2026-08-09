import { useEffect, useRef } from "react";

export function useReadingProgress(
  bookId: string,
  currentPage: number,
  totalPages: number,
  isLoaded: boolean,
) {
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoaded || totalPages === 0) return;

    // Save to local storage immediately
    const progressData = {
      currentPage,
      percentage: Math.round((currentPage / totalPages) * 100),
      lastOpened: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`reading_progress_${bookId}`, JSON.stringify(progressData));
    }

    // Debounce sync to backend
    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      // In a real implementation, we would call the React Query mutation here
      // For now, we simulate the API call with console.log, it will be handled by the api hooks
      console.log(`[Sync] Synced progress to backend: Book ${bookId} at Page ${currentPage}`);
    }, 10000); // 10 second debounce

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [bookId, currentPage, totalPages, isLoaded]);

  // Hook to retrieve initial progress
  const getInitialProgress = () => {
    if (typeof window === "undefined") return 1;
    try {
      const stored = localStorage.getItem(`reading_progress_${bookId}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.currentPage && data.currentPage > 0) {
          return data.currentPage as number;
        }
      }
    } catch {}
    return 1;
  };

  return { getInitialProgress };
}
