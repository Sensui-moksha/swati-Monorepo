import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Initialize worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

const pdfDocCache = new Map<string, Promise<pdfjsLib.PDFDocumentProxy>>();

export function usePdfStreaming(pdfUrl: string) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        let loadingTaskPromise = pdfDocCache.get(pdfUrl);

        if (!loadingTaskPromise) {
          const loadingTask = pdfjsLib.getDocument({
            url: encodeURI(pdfUrl),
            cMapUrl: "https://unpkg.com/pdfjs-dist@4.0.379/cmaps/",
            cMapPacked: true,
            standardFontDataUrl: "https://unpkg.com/pdfjs-dist@4.0.379/standard_fonts/",
            // Enterprise streaming optimizations
            rangeChunkSize: 65536, // 64KB chunks for HTTP Range Requests
            disableAutoFetch: false, // Prevents stalling if backend range requests are incomplete
            disableStream: false, // Enable streaming
          });
          loadingTaskPromise = loadingTask.promise;
          pdfDocCache.set(pdfUrl, loadingTaskPromise);
        }

        const doc = await loadingTaskPromise;

        if (!cancelled) {
          setPdf(doc);
          setTotalPages(doc.numPages);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("PDF Streaming Initialization Error:", err);
          setError(err);
          setIsLoading(false);
          pdfDocCache.delete(pdfUrl); // Remove failed load from cache
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return { pdf, totalPages, isLoading, error };
}
