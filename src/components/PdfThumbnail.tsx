import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
        const doc = await pdfjsLib.getDocument(encodeURI(src)).promise;
        if (cancelled) return;
        const page = await doc.getPage(1);
        if (cancelled) return;

        const container = containerRef.current!;
        const canvas = canvasRef.current!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rawVp = page.getViewport({ scale: 1 });

        const trimPct = 0.048;
        const cropX = rawVp.width * trimPct;
        const cropY = rawVp.height * trimPct;
        const liveW = rawVp.width - 2 * cropX;
        const liveH = rawVp.height - 2 * cropY;

        // Use smaller target width for thumbnails (300px CSS → 600px canvas max)
        const targetW = Math.min(container.clientWidth || 300, 400);
        const scale = (targetW / liveW) * dpr;
        const renderVp = page.getViewport({ scale });

        const offscreen = document.createElement("canvas");
        offscreen.width = Math.round(renderVp.width);
        offscreen.height = Math.round(renderVp.height);
        const offCtx = offscreen.getContext("2d", { alpha: false });

        if (!offCtx) return;
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = "high";

        await page.render({ canvasContext: offCtx, viewport: renderVp }).promise;
        if (cancelled) return;

        const finalW = Math.round(liveW * scale);
        const finalH = Math.round(liveH * scale);

        canvas.width = finalW;
        canvas.height = finalH;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(offscreen, cropX * scale, cropY * scale, finalW, finalH, 0, 0, finalW, finalH);
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
    return <img src={src} alt={alt || ""} className={className} loading="lazy" />;
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
