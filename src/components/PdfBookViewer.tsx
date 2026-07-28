import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  BookOpen,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LayoutGrid,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pageFlipPkg from "page-flip";

const PageFlip =
  (pageFlipPkg as any)?.PageFlip ||
  (pageFlipPkg as any)?.default?.PageFlip ||
  (pageFlipPkg as any)?.default ||
  pageFlipPkg;

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

/** Renders a single PDF page into a canvas with crisp high-DPI resolution without cutting off text */
function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  targetWidth = 1000,
) {
  pdfDoc.getPage(pageNum).then((page) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vp = page.getViewport({ scale: 1 });
    const scale = (targetWidth / vp.width) * dpr;
    const renderVp = page.getViewport({ scale });

    canvas.width = renderVp.width;
    canvas.height = renderVp.height;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      page.render({ canvasContext: ctx, viewport: renderVp });
    }
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
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const bookElementRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<any>(null);
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

  // Dynamic responsive page size calculator
  const updateDimensions = useCallback(() => {
    if (
      !isOpen ||
      !pdf ||
      !pagesContainerRef.current ||
      !containerRef.current ||
      totalPages === 0
    )
      return;

    const container = containerRef.current;
    const containerW = container.clientWidth || window.innerWidth;
    const containerH = container.clientHeight || window.innerHeight - 48;

    pdf.getPage(1).then((page1) => {
      const rawVp = page1.getViewport({ scale: 1 });
      const page1Any = page1 as any;
      const cropBox =
        page1Any.cropBox && page1Any.cropBox.length === 4 ? page1Any.cropBox : null;

      const paperW = cropBox ? cropBox[2] - cropBox[0] : rawVp.width;
      const paperH = cropBox ? cropBox[3] - cropBox[1] : rawVp.height;

      const isMobile = containerW < 768;
      const isSingleMode = totalPages === 1 || isMobile;
      const pagesInSpread = isSingleMode ? 1 : 2;

      // Strict viewport boundary bounds to ensure 100% zero vertical/horizontal scrolling
      const maxH = Math.max(containerH - 40, 280);
      const maxW = Math.max((containerW - (isMobile ? 16 : 40)) / pagesInSpread, 180);

      const scale = Math.min(maxH / paperH, maxW / paperW);
      const pageW = Math.round(paperW * scale);
      const pageH = Math.round(paperH * scale);

      // Create or update PageFlip instance
      if (!pageFlipRef.current) {
        const pageFlip = new PageFlip(pagesContainerRef.current!, {
          width: pageW,
          height: pageH,
          size: "fixed",
          minWidth: 160,
          maxWidth: 1400,
          minHeight: 240,
          maxHeight: 1800,
          drawShadow: true,
          maxShadowOpacity: 0.6,
          showCover: totalPages > 1,
          mobileScrollSupport: false,
          usePortrait: isSingleMode,
          autoCenter: true,
          startPage: 0,
        });

        const pageElements = pagesContainerRef.current!.querySelectorAll(".st-page");
        if (pageElements.length > 0) {
          pageFlip.loadFromHTML(pageElements as any);
          pageFlipRef.current = pageFlip;

          pageFlip.on("flip", (e: any) => {
            const newPage = (e.data as number) + 1;
            setCurrentPage(newPage);
            playPaperFlipSound(isMuted);
          });
        }
      } else {
        try {
          pageFlipRef.current.update({
            width: pageW,
            height: pageH,
            usePortrait: isSingleMode,
            showCover: totalPages > 1,
            autoCenter: true,
          });
        } catch {
          // Fallback update
        }
      }
    });
  }, [isOpen, pdf, totalPages, isMuted]);

  // Initialize PageFlip engine once PDF is loaded
  useEffect(() => {
    if (!isOpen || !pdf || totalPages === 0) return;

    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {}
      pageFlipRef.current = null;
    }

    updateDimensions();

    return () => {
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch {}
        pageFlipRef.current = null;
      }
    };
  }, [isOpen, pdf, totalPages, updateDimensions]);

  // ResizeObserver for continuous responsive adaptation
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen, updateDimensions]);

  // Render individual page canvases when PDF doc is ready
  useEffect(() => {
    if (!pdf || totalPages === 0 || !pagesContainerRef.current) return;

    for (let p = 1; p <= totalPages; p++) {
      const canvas = pagesContainerRef.current.querySelector(
        `canvas[data-page="${p}"]`,
      ) as HTMLCanvasElement;
      if (canvas) {
        renderPdfPageToCanvas(pdf, p, canvas, 1000);
      }
    }
  }, [pdf, totalPages]);

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

  // Wheel zoom support
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoomLevel((z) => Math.min(Math.max(0.8, z + delta), 2.5));
    }
  };

  // Double click zoom toggle
  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(1.5);
    } else {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Pan dragging when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  // Compute mathematical centering transform for Cover (Pg 1), Spreads, and Back Cover
  const getCenterTransform = () => {
    if (totalPages <= 1)
      return `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;

    let translateX = "0%";
    if (currentPage === 1) {
      translateX = "-25%"; // Dead-center Front Cover (Page 1) on screen
    } else if (currentPage === totalPages && totalPages % 2 === 0) {
      translateX = "25%"; // Dead-center Back Cover on screen
    }

    return `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px) translateX(${translateX})`;
  };

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
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel((z) => Math.max(z - 0.25, 0.8));
              if (zoomLevel <= 1.25) setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          {zoomLevel !== 1 && (
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-stone-800 mx-1" />

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
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative flex items-center justify-center p-2 md:p-4 overflow-hidden ${
          zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, #24201c 0%, #151210 60%, #090807 100%)",
        }}
      >
        {/* Subtle Ambient Vignette Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-black/30 pointer-events-none" />

        {/* 3D PageFlip Container with mathematical Cover & Spread Centering */}
        <div
          ref={bookElementRef}
          className="relative transition-transform duration-500 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{ transform: getCenterTransform() }}
        >
          <div ref={pagesContainerRef} className="st-flip-book shadow-2xl">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;

              return (
                <div
                  key={pageNum}
                  className="st-page bg-[#fdfcfa] overflow-hidden relative shadow-lg select-none"
                  data-density="soft"
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
