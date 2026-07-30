import { useEffect, useState } from "react";

export function useOfflineCache(bookId: string) {
  const [isCachedForOffline, setIsCachedForOffline] = useState(false);

  useEffect(() => {
    // Check if Service Worker or IndexedDB has cached this book
    if (typeof window !== "undefined" && 'caches' in window) {
      caches.has('publication-cache').then((hasCache) => {
        if (!hasCache) return;
        caches.open('publication-cache').then((cache) => {
          // Check if we have the PDF in cache
          // In a real implementation we would match the exact request URL
          cache.match(`/api/v1/pdf/stream/${bookId}`).then((response) => {
            setIsCachedForOffline(!!response);
          });
        });
      });
    }
  }, [bookId]);

  const toggleOfflineCache = async (pdfUrl: string) => {
    if (typeof window === "undefined" || !('caches' in window)) return;
    
    try {
      const cache = await caches.open('publication-cache');
      
      if (isCachedForOffline) {
        // Remove from cache
        await cache.delete(pdfUrl);
        setIsCachedForOffline(false);
      } else {
        // Add to cache (Note: For 30MB PDFs, this will use significant quota)
        // We fetch it and put it in cache
        const response = await fetch(pdfUrl);
        if (response.ok) {
          await cache.put(pdfUrl, response);
          setIsCachedForOffline(true);
        }
      }
    } catch (err) {
      console.error("Offline Cache Error:", err);
    }
  };

  return { isCachedForOffline, toggleOfflineCache };
}
