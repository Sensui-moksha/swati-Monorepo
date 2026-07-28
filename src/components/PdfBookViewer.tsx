import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  X,
  BookOpen,
  Columns,
  Square,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfBookViewerProps {
  pdfUrl?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

/** Renders a single PDF page to a canvas */
function PdfPageCanvas({
  pdf,
  pageNum,
  containerRef,
}: {
  pdf: pdfjsLib.PDFDocumentProxy | null;
  pageNum: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!pdf || !canvasRef.current || !containerRef.current) return;
    if (pageNum < 1 || pageNum > pdf.numPages) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    pdf.getPage(pageNum).then((page) => {
      const dpr = window.devicePixelRatio || 1;
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const vp = page.getViewport({ scale: 1 });

      // Scale to fill container, then multiply by DPR for crisp rendering
      const cssScale = Math.min(containerW / vp.width, containerH / vp.height);
      const renderScale = cssScale * dpr;
      const renderVp = page.getViewport({ scale: renderScale });

      // Set canvas pixel size to high-res, but CSS size to container fit
      canvas.width = renderVp.width;
      canvas.height = renderVp.height;
      canvas.style.width = `${renderVp.width / dpr}px`;
      canvas.style.height = `${renderVp.height / dpr}px`;

      const ctx = canvas.getContext("2d")!;
      const renderTask = page.render({ canvasContext: ctx, viewport: renderVp });
      renderTaskRef.current = renderTask;
      renderTask.promise.catch(() => {});
    });

    return () => {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    };
  }, [pdf, pageNum]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full max-h-full object-contain mx-auto block"
    />
  );
}

export const PdfBookViewer: React.FC<PdfBookViewerProps> = ({
  pdfUrl,
  title,
  isOpen,
  onClose,
}) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [viewMode, setViewMode] = useState<"spread" | "single">("spread");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [turning, setTurning] = useState<null | "next" | "prev">(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const singleRef = useRef<HTMLDivElement>(null);

  const targetPdfUrl = pdfUrl || "/documents/EDITOR GARI SANMANAPATRAM.pdf";

  // Load PDF document
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadPdf = async () => {
      try {
        const doc = await pdfjsLib.getDocument(encodeURI(targetPdfUrl)).promise;
        if (cancelled) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setCurrentSpread(0);
        if (doc.numPages === 1) {
          setViewMode("single");
        } else {
          setViewMode("spread");
        }
      } catch (e) {
        console.error("PDF load error:", e);
      }
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [targetPdfUrl, isOpen]);

  // Page calculations
  const leftPageNum = viewMode === "spread" ? currentSpread * 2 + 1 : currentSpread + 1;
  const rightPageNum = viewMode === "spread" ? currentSpread * 2 + 2 : null;
  const maxSpreads = viewMode === "spread" ? Math.ceil(totalPages / 2) : totalPages;

  const handleNext = useCallback(() => {
    if (currentSpread >= maxSpreads - 1 || turning) return;
    setTurning("next");
    setTimeout(() => {
      setCurrentSpread((s) => s + 1);
      setTurning(null);
    }, 500);
  }, [currentSpread, maxSpreads, turning]);

  const handlePrev = useCallback(() => {
    if (currentSpread <= 0 || turning) return;
    setTurning("prev");
    setTimeout(() => {
      setCurrentSpread((s) => s - 1);
      setTurning(null);
    }, 500);
  }, [currentSpread, turning]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") handleNext();
      if (e.key === "ArrowLeft" || e.key === "PageUp") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const pageLabel = viewMode === "spread"
    ? `${leftPageNum}${rightPageNum && rightPageNum <= totalPages ? `–${rightPageNum}` : ""}`
    : String(leftPageNum);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-stone-950 text-stone-100 select-none overflow-hidden">
      {/* Header Bar */}
      <header className="flex h-12 items-center justify-between border-b border-stone-800 bg-stone-900/95 px-4 z-30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary grid place-items-center">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-sm font-semibold">{title}</h2>
            <p className="text-[10px] text-stone-400">Swathi Book Viewer</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-1.5">
          <button onClick={handlePrev} disabled={currentSpread <= 0 || !!turning}
            className="flex items-center gap-0.5 rounded px-2 py-1 text-xs bg-stone-800 hover:bg-stone-700 disabled:opacity-30 border border-stone-700">
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <div className="px-2 py-1 rounded bg-stone-800/80 text-xs font-mono border border-stone-700/60">
            <span className="text-stone-400">Pg </span>
            <span className="font-bold text-primary">{pageLabel}</span>
            <span className="text-stone-400"> / {totalPages || "…"}</span>
          </div>
          <button onClick={handleNext} disabled={currentSpread >= maxSpreads - 1 || !!turning}
            className="flex items-center gap-0.5 rounded px-2 py-1 text-xs bg-stone-800 hover:bg-stone-700 disabled:opacity-30 border border-stone-700">
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-stone-800 rounded p-0.5 border border-stone-700">
            <button onClick={() => { setViewMode("spread"); setCurrentSpread(0); }}
              className={`px-2 py-0.5 rounded text-xs ${viewMode === "spread" ? "bg-primary text-primary-foreground font-semibold" : "text-stone-300 hover:text-white"}`}>
              <Columns className="h-3 w-3 inline mr-1" />Spread
            </button>
            <button onClick={() => { setViewMode("single"); setCurrentSpread(0); }}
              className={`px-2 py-0.5 rounded text-xs ${viewMode === "single" ? "bg-primary text-primary-foreground font-semibold" : "text-stone-300 hover:text-white"}`}>
              <Square className="h-3 w-3 inline mr-1" />Single
            </button>
          </div>
          <a href={encodeURI(targetPdfUrl)} download className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white">
            <Download className="h-4 w-4" />
          </a>
          <button onClick={toggleFullscreen} className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="ml-1 h-7 w-7 grid place-items-center rounded-full bg-stone-800 hover:bg-red-600 text-stone-300 hover:text-white border border-stone-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Book Stage — Premium ambient reading environment */}
      <div
        className="flex-1 flex items-center justify-center p-3 md:p-6 overflow-hidden relative"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #26221f 0%, #171412 55%, #0b0908 100%)",
        }}
      >
        {/* Ambient lighting subtle top highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Click zones for navigation */}
        <button
          onClick={handlePrev}
          disabled={currentSpread <= 0 || !!turning}
          className="absolute left-0 top-12 bottom-0 w-20 z-20 cursor-pointer opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default disabled:opacity-0 flex items-center justify-center"
          aria-label="Previous page"
        >
          <div className="bg-stone-900/80 backdrop-blur border border-stone-700/60 rounded-full p-2.5 shadow-xl">
            <ChevronLeft className="h-6 w-6 text-stone-100" />
          </div>
        </button>
        <button
          onClick={handleNext}
          disabled={currentSpread >= maxSpreads - 1 || !!turning}
          className="absolute right-0 top-12 bottom-0 w-20 z-20 cursor-pointer opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default disabled:opacity-0 flex items-center justify-center"
          aria-label="Next page"
        >
          <div className="bg-stone-900/80 backdrop-blur border border-stone-700/60 rounded-full p-2.5 shadow-xl">
            <ChevronRight className="h-6 w-6 text-stone-100" />
          </div>
        </button>

        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: 2000 }}
        >
          {viewMode === "spread" ? (
            /* ──── TWO-PAGE BOOK SPREAD ──── */
            <div
              className="relative flex h-[calc(100vh-5.5rem)] w-full max-w-[1150px] rounded-lg overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(0,0,0,0.5)] border border-stone-800/40"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Left page */}
              <div
                ref={leftRef}
                className="relative flex-1 h-full bg-[#fdfbf7] flex items-center justify-center overflow-hidden"
                style={{ boxShadow: "inset -12px 0 24px -10px rgba(0,0,0,0.35)" }}
              >
                {pdf && leftPageNum <= totalPages ? (
                  <PdfPageCanvas pdf={pdf} pageNum={leftPageNum} containerRef={leftRef} />
                ) : (
                  <div className="text-stone-400 font-serif text-sm">Loading…</div>
                )}
                <div className="absolute bottom-3 left-4 bg-stone-900/80 backdrop-blur text-stone-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full pointer-events-none z-10 border border-stone-700/50">
                  Page {leftPageNum}
                </div>
              </div>

              {/* Spine shadow & binding groove */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-black/50 via-black/15 to-black/50 z-20 pointer-events-none border-x border-black/20" />

              {/* Right page */}
              <div
                ref={rightRef}
                className="relative flex-1 h-full bg-[#fdfbf7] flex items-center justify-center overflow-hidden"
                style={{ boxShadow: "inset 12px 0 24px -10px rgba(0,0,0,0.35)" }}
              >
                {pdf && rightPageNum && rightPageNum <= totalPages ? (
                  <PdfPageCanvas pdf={pdf} pageNum={rightPageNum} containerRef={rightRef} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#211c18] text-stone-300 p-8 text-center border-l border-stone-800">
                    <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 grid place-items-center mb-3 text-amber-500">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="font-serif text-base font-semibold text-stone-200 tracking-wide">
                      Swathi Publications
                    </div>
                    <div className="text-xs text-stone-400 mt-1 max-w-[200px]">
                      End of Document
                    </div>
                  </div>
                )}
                {rightPageNum && rightPageNum <= totalPages && (
                  <div className="absolute bottom-3 right-4 bg-stone-900/80 backdrop-blur text-stone-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full pointer-events-none z-10 border border-stone-700/50">
                    Page {rightPageNum}
                  </div>
                )}
              </div>

              {/* Page flip animation overlay */}
              <AnimatePresence>
                {turning === "next" && (
                  <motion.div
                    key="flip-next"
                    className="absolute top-0 bottom-0 left-1/2 w-1/2 bg-[#f5f0e6] z-30 overflow-hidden"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -180 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
                    style={{ transformOrigin: "left center", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10 pointer-events-none z-10" />
                  </motion.div>
                )}
                {turning === "prev" && (
                  <motion.div
                    key="flip-prev"
                    className="absolute top-0 bottom-0 right-1/2 w-1/2 bg-[#f5f0e6] z-30 overflow-hidden"
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
                    style={{ transformOrigin: "right center", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-black/10 pointer-events-none z-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ──── SINGLE PAGE VIEW ──── */
            <div
              ref={singleRef}
              className="relative h-[calc(100vh-5rem)] w-full max-w-[600px] bg-[#f5f0e6] rounded-md overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "0 20px 60px -10px rgba(0,0,0,0.8)" }}
            >
              {pdf && leftPageNum <= totalPages ? (
                <PdfPageCanvas pdf={pdf} pageNum={leftPageNum} containerRef={singleRef} />
              ) : (
                <div className="text-stone-400 font-serif text-sm">Loading…</div>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-stone-900/70 text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none z-10">
                Page {leftPageNum}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
