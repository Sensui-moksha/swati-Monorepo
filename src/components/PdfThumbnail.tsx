import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * Renders page 1 of a PDF as a <canvas> thumbnail.
 * If coverImage is NOT a PDF path (doesn't end in .pdf), falls back to <img>.
 */
export function PdfThumbnail({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (src.toLowerCase().endsWith(".pdf")) {
      setIsPdf(true);
    }
  }, [src]);

  useEffect(() => {
    if (!isPdf || !canvasRef.current || !containerRef.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        const doc = await pdfjsLib.getDocument(encodeURI(src)).promise;
        if (cancelled) return;
        const page = await doc.getPage(1);
        if (cancelled) return;

        const container = containerRef.current!;
        const canvas = canvasRef.current!;
        const dpr = window.devicePixelRatio || 1;
        const vp = page.getViewport({ scale: 1 });

        // Scale to fill container width, multiply by DPR for clarity
        const cssScale = container.clientWidth / vp.width;
        const renderScale = cssScale * dpr;
        const renderVp = page.getViewport({ scale: renderScale });

        canvas.width = renderVp.width;
        canvas.height = renderVp.height;
        canvas.style.width = `${renderVp.width / dpr}px`;
        canvas.style.height = `${renderVp.height / dpr}px`;

        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: renderVp }).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        // Failed to load — show placeholder
      }
    };

    render();
    return () => { cancelled = true; };
  }, [isPdf, src]);

  if (!isPdf) {
    return <img src={src} alt={alt || ""} className={className} />;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
          <span className="text-stone-400 text-xs">Loading…</span>
        </div>
      )}
    </div>
  );
}
