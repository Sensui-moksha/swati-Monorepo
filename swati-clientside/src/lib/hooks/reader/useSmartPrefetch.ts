import { useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

export function useSmartPrefetch(
  pdf: PDFDocumentProxy | null,
  currentPage: number,
  totalPages: number,
) {
  const lastPageRef = useRef(currentPage);
  const velocityRef = useRef<{ timestamp: number; direction: number }[]>([]);

  useEffect(() => {
    if (!pdf || totalPages === 0) return;

    const now = Date.now();
    const direction =
      currentPage > lastPageRef.current ? 1 : currentPage < lastPageRef.current ? -1 : 0;

    if (direction !== 0) {
      // Track velocity (keep last 5 moves)
      velocityRef.current.push({ timestamp: now, direction });
      if (velocityRef.current.length > 5) {
        velocityRef.current.shift();
      }
    }
    lastPageRef.current = currentPage;

    // Calculate bias
    let bias = 1; // Default prefetch forward
    if (velocityRef.current.length > 0) {
      const recentMoves = velocityRef.current.filter((m) => now - m.timestamp < 10000); // within 10s
      if (recentMoves.length > 0) {
        const netDirection = recentMoves.reduce((acc, m) => acc + m.direction, 0);
        if (netDirection < 0) bias = -1;
      }
    }

    const prefetchPages: number[] = [];

    // Always prefetch next and previous adjacent page
    if (currentPage + 1 <= totalPages) prefetchPages.push(currentPage + 1);
    if (currentPage - 1 >= 1) prefetchPages.push(currentPage - 1);

    // If reading fast in a direction, prefetch further ahead
    const recentFastMoves = velocityRef.current.filter((m) => now - m.timestamp < 5000);
    if (recentFastMoves.length >= 2) {
      if (bias === 1 && currentPage + 2 <= totalPages) prefetchPages.push(currentPage + 2);
      if (bias === -1 && currentPage - 2 >= 1) prefetchPages.push(currentPage - 2);
      if (recentFastMoves.length >= 4) {
        if (bias === 1 && currentPage + 3 <= totalPages) prefetchPages.push(currentPage + 3);
      }
    }

    // Trigger PDF.js getPage to load it into memory (without rendering)
    // requestIdleCallback prevents this from blocking main thread render
    const schedule =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 16);

    prefetchPages.forEach((pageNum) => {
      schedule(() => {
        pdf.getPage(pageNum).catch(() => {
          // Ignore prefetch errors
        });
      });
    });
  }, [pdf, currentPage, totalPages]);
}
