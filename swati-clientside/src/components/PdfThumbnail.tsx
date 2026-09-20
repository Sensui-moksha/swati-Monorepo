import { useEffect, useRef, useState } from "react";
import { getPdfDocument, getTrimBoxCrop } from "./PdfBookViewer";

/**
 * Renders page 1 of a PDF as a <canvas> thumbnail.
 * Lazy-loaded via IntersectionObserver — only renders when scrolled into view.
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (src.toLowerCase().endsWith(".pdf")) {
      setIsPdf(true);
    }
  }, [src]);

  // Lazy visibility detection — only start rendering when in viewport
  useEffect(() => {
    if (!isPdf || !containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isPdf]);

  useEffect(() => {
    if (!isPdf || !isVisible || !canvasRef.current || !containerRef.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        const doc = await getPdfDocument(src);
        if (cancelled) return;
        const page = await doc.getPage(1);
        if (cancelled) return;

        const container = containerRef.current!;
        const canvas = canvasRef.current!;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const viewBox = getTrimBoxCrop(page);
        const liveW = viewBox[2] - viewBox[0];

        const targetW = Math.min(container.clientWidth || 300, 400);
        const scale = (targetW / liveW) * dpr;
        const renderVp = page.getViewport({ scale, viewBox } as any);

        canvas.width = Math.round(renderVp.width);
        canvas.height = Math.round(renderVp.height);
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        await page.render({ canvasContext: ctx, viewport: renderVp }).promise;
        if (!cancelled) {
          setLoaded(true);
        }
      } catch {
        // Failed to load — show placeholder
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [isPdf, isVisible, src]);

  if (!isPdf) {
    const fallbackSrc =
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
    const imageSrc = src || fallbackSrc;
    return (
      <img
        src={imageSrc}
        alt={alt || ""}
        className={className}
        loading="lazy"
        onError={(e) => {
          if (e.currentTarget.src !== fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        }}
      />
    );
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
