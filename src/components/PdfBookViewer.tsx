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

/** Renders a single PDF page into a canvas with high-DPI quality, stripping prepress target dots and alignment markers */
function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  targetWidth = 1000,
) {
  pdfDoc.getPage(pageNum).then((page) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rawVp = page.getViewport({ scale: 1 });

    // Prepress trim: strip out 4.8% outer margin containing registration target dots & alignment crosshairs / aim marks
    const trimPct = 0.048;
    const cropX = rawVp.width * trimPct;
    const cropY = rawVp.height * trimPct;
    const liveW = rawVp.width - 2 * cropX;
    const liveH = rawVp.height - 2 * cropY;

    const scale = (targetWidth / liveW) * dpr;
    const renderVp = page.getViewport({ scale });

    // High resolution offscreen render
    const offscreen = document.createElement("canvas");
    offscreen.width = Math.round(renderVp.width);
    offscreen.height = Math.round(renderVp.height);
    const offCtx = offscreen.getContext("2d", { alpha: false });

    if (!offCtx) return;

    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = "high";

    page.render({ canvasContext: offCtx, viewport: renderVp }).promise.then(() => {
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
    const containerH = container.clientHeight || window.innerHeight - 44;

    pdf.getPage(1).then((page1) => {
      const rawVp = page1.getViewport({ scale: 1 });
      const trimPct = 0.048;
      const paperW = rawVp.width * (1 - 2 * trimPct);
      const paperH = rawVp.height * (1 - 2 * trimPct);

      const isMobile = containerW < 768;
      const isSingleMode = totalPages === 1 || isMobile;
      const pagesInSpread = isSingleMode ? 1 : 2;

      // Fill 90% of viewport on desktop, 94% on mobile for optimal prominence
      const fillRatio = isMobile ? 0.94 : 0.90;
      const availW = Math.max(containerW * fillRatio, 280);
      const availH = Math.max(containerH * fillRatio, 320);

      const spreadPaperW = paperW * pagesInSpread;
      const scale = Math.min(availW / spreadPaperW, availH / paperH);

      const pageW = Math.round(paperW * scale);
      const pageH = Math.round(paperH * scale);

      // Create or update PageFlip instance
      if (!pageFlipRef.current) {
        const pageFlip = new PageFlip(pagesContainerRef.current!, {
          width: pageW,
          height: pageH,
          size: "fixed",
          minWidth: Math.round(pageW * 0.4),
          maxWidth: Math.round(pageW * 2.0),
          minHeight: Math.round(pageH * 0.4),
          maxHeight: Math.round(pageH * 2.0),
          drawShadow: true,
          maxShadowOpacity: 0.4,
          flippingTime: 700,
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

  // Mobile Multi-Touch Gestures: Two-finger Pinch Zoom & Pan
  const touchPinchDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const touchPanStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchPinchDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
      touchPanStartRef.current = null;
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      touchPanStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
      touchPinchDistRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchPinchDistRef.current !== null) {
      if (e.cancelable) e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const scaleRatio = currentDist / touchPinchDistRef.current;
      const newZoom = Math.min(Math.max(0.8, touchStartZoomRef.current * scaleRatio), 3.0);
      setZoomLevel(newZoom);
      if (newZoom <= 1.05) {
        setPanOffset({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && touchPanStartRef.current !== null && zoomLevel > 1) {
      if (e.cancelable) e.preventDefault();
      setPanOffset({
        x: e.touches[0].clientX - touchPanStartRef.current.x,
        y: e.touches[0].clientY - touchPanStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchPinchDistRef.current = null;
    }
    if (e.touches.length === 0) {
      touchPanStartRef.current = null;
    }
  };

  if (!isOpen) return null;

  // Compute mathematical transform for zoom & user pan
  const getCenterTransform = () => {
    return `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;
  };

  const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;
  const isSinglePage = totalPages <= 1 || isMobileViewport;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0d0b0a] text-stone-100 select-none overflow-hidden font-sans">
      {/* ──── FlippingBook Compact Studio Header ──── */}
      <header className="flex h-11 items-center justify-between border-b border-stone-800/80 bg-stone-900/95 px-3 z-30 shrink-0 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 grid place-items-center shrink-0 shadow-inner">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-xs font-semibold text-stone-100 tracking-wide">
              {title}
            </h2>
          </div>
        </div>

        {/* Page counter display */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition disabled:opacity-20"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800/90 text-xs font-mono border border-stone-700/60 shadow-inner">
            <span className="text-stone-400 text-[11px]">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => jumpToPage(parseInt(e.target.value, 10) || 1)}
              className="w-8 text-center bg-stone-950 text-amber-400 font-bold text-xs rounded border border-stone-700 outline-none focus:border-amber-500"
            />
            <span className="text-stone-400 text-[11px]">of {totalPages || "…"}</span>
          </div>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition disabled:opacity-20"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded transition ${isMuted ? "text-stone-500 hover:text-stone-300" : "text-amber-400 hover:bg-stone-800"}`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded transition ${showThumbnails ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-stone-300 hover:bg-stone-800"}`}
            title="Toggle Page Thumbnails"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          <div className="h-3.5 w-px bg-stone-800 mx-1" />

          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel((z) => Math.max(z - 0.25, 0.8));
              if (zoomLevel <= 1.25) setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
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
              className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
              title="Reset Zoom (Fit to Screen)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="h-3.5 w-px bg-stone-800 mx-1" />

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
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
            className="ml-1 h-6 w-6 grid place-items-center rounded-full bg-stone-800 hover:bg-red-600 text-stone-300 hover:text-white border border-stone-700/80 transition"
            title="Close Viewer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ──── Book Stage — Studio Radial Atmosphere ──── */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`flex-1 relative flex items-center justify-center overflow-hidden ${
          zoomLevel > 1 ? "cursor-grab active:cursor-grabbing touch-none" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #1c1917 0%, #12100e 55%, #080706 100%)",
        }}
      >
        {/* Warm Ambient Spotlight behind the Book */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(217, 119, 6, 0.07) 0%, transparent 70%)",
          }}
        />

        {/* Dedicated Relative Book Container (Anchors navigation arrows directly to book edges) */}
        <div
          ref={bookElementRef}
          className="relative transition-transform duration-300 ease-out flex items-center justify-center"
          style={{ transform: getCenterTransform() }}
        >
          {/* Book-relative Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="absolute -left-3 md:-left-16 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-stone-900/80 hover:bg-amber-600 text-stone-200 hover:text-white border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all duration-200 opacity-60 hover:opacity-100 disabled:opacity-0 hover:scale-110 active:scale-95"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Book-relative Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="absolute -right-3 md:-right-16 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-stone-900/80 hover:bg-amber-600 text-stone-200 hover:text-white border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all duration-200 opacity-60 hover:opacity-100 disabled:opacity-0 hover:scale-110 active:scale-95"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* PageFlip Container with Commercial Drop Shadows & Edge Depth */}
          <div
            ref={pagesContainerRef}
            className="st-flip-book relative rounded-[2px] transition-shadow duration-300"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 12px 24px -8px rgba(0, 0, 0, 0.45)",
            }}
          >
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;

              return (
                <div
                  key={pageNum}
                  className="st-page bg-[#fdfcfa] overflow-hidden relative select-none rounded-[1px]"
                  data-density="soft"
                >
                  <canvas
                    data-page={pageNum}
                    className="w-full h-full object-contain mx-auto block"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
                  />
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-stone-900/60 text-stone-300 text-[9px] font-mono px-2 py-0.5 rounded-full pointer-events-none z-10 border border-stone-700/40 backdrop-blur-sm opacity-80">
                    {pageNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Soft Natural Spine Crease Overlay (Blends seamlessly into open gutter without dark vertical lines during flip) */}
          {!isSinglePage && currentPage > 1 && currentPage < totalPages && (
            <div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[18px] pointer-events-none z-10 opacity-35 mix-blend-multiply"
              style={{
                background:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 65%, transparent 100%)",
              }}
            />
          )}
        </div>
      </div>

      {/* ──── Bottom Filmstrip Thumbnail Navigation ──── */}
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

