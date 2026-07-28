import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  X,
  BookOpen,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LayoutGrid,
  Layers,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PageFlip } from "page-flip";

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

/** Synthesize realistic paper flip sound using Web Audio API */
function playPaperFlipSound(isMuted: boolean) {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.16;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 3);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration);
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
  } catch {
    // Audio Context blocked or unavailable
  }
}

/** Renders a single PDF page into a canvas, trimming print crop marks if present */
function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  targetWidth = 900,
  trimCropMarks = true,
) {
  pdfDoc.getPage(pageNum).then((page) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rawVp = page.getViewport({ scale: 1 });

    // Print bleed / crop mark margin trimming (~3.4% of page dimensions)
    const cropX = trimCropMarks ? rawVp.width * 0.034 : 0;
    const cropY = trimCropMarks ? rawVp.height * 0.034 : 0;
    const croppedW = rawVp.width - 2 * cropX;
    const croppedH = rawVp.height - 2 * cropY;

    const scale = (targetWidth / croppedW) * dpr;
    const renderVp = page.getViewport({ scale });

    // Offscreen render canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = renderVp.width;
    offscreen.height = renderVp.height;
    const offCtx = offscreen.getContext("2d");

    if (!offCtx) return;

    page.render({ canvasContext: offCtx, viewport: renderVp }).promise.then(() => {
      // Set target canvas size to cropped paper dimensions
      const finalW = Math.round(croppedW * scale);
      const finalH = Math.round(croppedH * scale);

      canvas.width = finalW;
      canvas.height = finalH;
      canvas.style.width = `${finalW / dpr}px`;
      canvas.style.height = `${finalH / dpr}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          offscreen,
          cropX * scale,
          cropY * scale,
          finalW,
          finalH,
          0,
          0,
          finalW,
          finalH,
        );
      }
    });
  });
}

export const PdfBookViewer: React.FC<PdfBookViewerProps> = ({
  pdfUrl,
  title,
  isOpen,
  onClose,
}) => {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [trimCropMarks, setTrimCropMarks] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const bookElementRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);

  const targetPdfUrl = pdfUrl || "/documents/EDITOR GARI SANMANAPATRAM.pdf";

  // Load PDF Document
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async () => {
      try {
        const doc = await pdfjsLib.getDocument(encodeURI(targetPdfUrl)).promise;
        if (cancelled) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("PDF load error:", err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [targetPdfUrl, isOpen]);

  // Initialize PageFlip engine once PDF is loaded and modal is visible
  useEffect(() => {
    if (!isOpen || !pdf || !pagesContainerRef.current || totalPages === 0) return;

    // Destroy existing instance if any
    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {}
      pageFlipRef.current = null;
    }

    const container = containerRef.current;
    if (!container) return;

    const containerW = container.clientWidth || 1000;
    const containerH = container.clientHeight || 700;

    // Determine page dimensions based on actual paper aspect ratio of page 1
    pdf.getPage(1).then((page1) => {
      const rawVp = page1.getViewport({ scale: 1 });
      const cropX = trimCropMarks ? rawVp.width * 0.034 : 0;
      const cropY = trimCropMarks ? rawVp.height * 0.034 : 0;
      const paperW = rawVp.width - 2 * cropX;
      const paperH = rawVp.height - 2 * cropY;

      const isSingleMode = totalPages === 1;
      const pagesInSpread = isSingleMode ? 1 : 2;

      // Fit page perfectly within container maintaining exact paper aspect ratio
      const maxH = containerH - 32;
      const maxW = (containerW - 48) / pagesInSpread;

      const scaleH = maxH / paperH;
      const scaleW = maxW / paperW;
      const scale = Math.min(scaleH, scaleW);

      const pageW = Math.round(paperW * scale);
      const pageH = Math.round(paperH * scale);

      const pageFlip = new PageFlip(pagesContainerRef.current!, {
        width: pageW,
        height: pageH,
        size: "fixed",
        minWidth: 200,
        maxWidth: 1200,
        minHeight: 300,
        maxHeight: 1600,
        drawShadow: true,
        maxShadowOpacity: 0.7,
        showCover: totalPages > 1,
        mobileScrollSupport: false,
        usePortrait: isSingleMode,
        startPage: 0,
      });

      const pageElements = pagesContainerRef.current!.querySelectorAll(".st-page");
      if (pageElements.length > 0) {
        pageFlip.loadFromHTML(pageElements as any);
        pageFlipRef.current = pageFlip;

        pageFlip.on("flip", (e) => {
          const newPage = (e.data as number) + 1;
          setCurrentPage(newPage);
          playPaperFlipSound(isMuted);
        });
      }
    });

    return () => {
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch {}
        pageFlipRef.current = null;
      }
    };
  }, [isOpen, pdf, totalPages]);

  // Render individual page canvases when PDF doc is ready
  useEffect(() => {
    if (!pdf || totalPages === 0 || !pagesContainerRef.current) return;

    for (let p = 1; p <= totalPages; p++) {
      const canvas = pagesContainerRef.current.querySelector(
        `canvas[data-page="${p}"]`,
      ) as HTMLCanvasElement;
      if (canvas) {
        renderPdfPageToCanvas(pdf, p, canvas, 950, trimCropMarks);
      }
    }
  }, [pdf, totalPages, trimCropMarks]);

  // Keyboard navigation
  const handlePrev = useCallback(() => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipPrev();
    }
  }, []);

  const handleNext = useCallback(() => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipNext();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "PageUp") handlePrev();
      if (e.key === "ArrowRight" || e.key === "PageDown") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handlePrev, handleNext, onClose]);

  const jumpToPage = (pageNum: number) => {
    if (pageFlipRef.current && pageNum >= 1 && pageNum <= totalPages) {
      pageFlipRef.current.flip(pageNum - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#12100e] text-stone-100 select-none overflow-hidden font-sans">
      {/* ──── FlippingBook Header ──── */}
      <header className="flex h-12 items-center justify-between border-b border-stone-800/80 bg-stone-900/95 px-4 z-30 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 grid place-items-center shadow-inner">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-sm font-semibold text-stone-100">
              {title}
            </h2>
            <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
              Swathi Interactive Flipbook
            </p>
          </div>
        </div>

        {/* Page counter display */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition disabled:opacity-30"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 px-3 py-1 rounded bg-stone-800/90 text-xs font-mono border border-stone-700/60 shadow-sm">
            <span className="text-stone-400">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => jumpToPage(parseInt(e.target.value, 10) || 1)}
              className="w-8 text-center bg-stone-950 text-amber-400 font-bold rounded border border-stone-700 outline-none focus:border-amber-500"
            />
            <span className="text-stone-400">of {totalPages || "…"}</span>
          </div>
          <button
            onClick={handleNext}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition disabled:opacity-30"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-md transition ${isMuted ? "text-stone-500 hover:text-stone-300" : "text-amber-400 hover:bg-stone-800"}`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-md transition ${showThumbnails ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-stone-300 hover:bg-stone-800"}`}
            title="Toggle Thumbnails Bar"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-stone-800 mx-1" />

          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          {zoomLevel !== 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-stone-800 mx-1" />

          <a
            href={encodeURI(targetPdfUrl)}
            download
            className="p-2 hover:bg-stone-800 rounded-md text-stone-300 hover:text-white"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-stone-800 rounded-md text-stone-300 hover:text-white"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="ml-1 h-7 w-7 grid place-items-center rounded-full bg-stone-800 hover:bg-red-600 text-stone-300 hover:text-white border border-stone-700 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ──── Book Stage — Premium Ambient Atmosphere ──── */}
      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, #24201c 0%, #151210 60%, #090807 100%)",
        }}
      >
        {/* Subtle Ambient Vignette Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-black/30 pointer-events-none" />

        {/* 3D PageFlip Container */}
        <div
          ref={bookElementRef}
          className="relative transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div ref={pagesContainerRef} className="st-flip-book shadow-2xl">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCover = pageNum === 1;

              return (
                <div
                  key={pageNum}
                  className="st-page bg-[#fdfcfa] overflow-hidden relative shadow-lg select-none"
                  data-density={isCover ? "hard" : "soft"}
                >
                  <canvas
                    data-page={pageNum}
                    className="w-full h-full object-contain mx-auto block"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-stone-900/70 text-stone-200 text-[9px] font-mono px-2 py-0.5 rounded pointer-events-none z-10">
                    {pageNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left & Right Edge Drag/Click Navigation Indicators */}
        <button
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-stone-900/70 hover:bg-stone-900 text-stone-200 border border-stone-700/60 shadow-2xl backdrop-blur transition opacity-40 hover:opacity-100 disabled:opacity-0"
          title="Previous Page"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-stone-900/70 hover:bg-stone-900 text-stone-200 border border-stone-700/60 shadow-2xl backdrop-blur transition opacity-40 hover:opacity-100 disabled:opacity-0"
          title="Next Page"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* ──── FlippingBook Bottom Filmstrip Thumbnail Navigation ──── */}
      {showThumbnails && pdf && (
        <div className="h-28 border-t border-stone-800 bg-stone-950/95 p-2 flex items-center gap-3 overflow-x-auto z-30 shrink-0 shadow-inner">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const active = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => jumpToPage(pageNum)}
                className={`relative flex-shrink-0 aspect-[3/4] h-20 rounded border overflow-hidden transition-all ${
                  active
                    ? "border-amber-500 ring-2 ring-amber-500/40 scale-105"
                    : "border-stone-800 hover:border-stone-600 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="w-full h-full bg-stone-900 flex items-center justify-center text-[10px] font-mono text-stone-400">
                  Pg {pageNum}
                </div>
                <div className="absolute bottom-1 right-1 bg-stone-900/90 text-amber-400 text-[8px] font-mono px-1 rounded">
                  {pageNum}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
