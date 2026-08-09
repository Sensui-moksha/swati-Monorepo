import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pageFlipPkg from "page-flip";
import { ReaderToolbar } from "./reader/ReaderToolbar";
import { ReaderSidebar } from "./reader/ReaderSidebar";
import { useReaderSettings } from "@/lib/hooks/reader/useReaderSettings";
import { usePdfStreaming } from "@/lib/hooks/reader/usePdfStreaming";
import { useSmartPrefetch } from "@/lib/hooks/reader/useSmartPrefetch";
import { useReadingProgress } from "@/lib/hooks/reader/useReadingProgress";
import { useOfflineCache } from "@/lib/hooks/reader/useOfflineCache";

const PageFlip =
  (pageFlipPkg as any)?.PageFlip ||
  (pageFlipPkg as any)?.default?.PageFlip ||
  (pageFlipPkg as any)?.default ||
  pageFlipPkg;

// ----------------------------------------------------------------------------
// Utilities (Preserved from original)
// ----------------------------------------------------------------------------
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
  } catch {}
}

export function getTrimBoxCrop(page: pdfjsLib.PDFPageProxy): [number, number, number, number] {
  const mediaBox = page.view;
  const mediaW = Math.abs(mediaBox[2] - mediaBox[0]);
  const mediaH = Math.abs(mediaBox[3] - mediaBox[1]);
  const trimBox = (page as any).trimBox || (page as any).cropBox;
  if (trimBox && Array.isArray(trimBox) && trimBox.length === 4) {
    const [tX1, tY1, tX2, tY2] = trimBox;
    const trimW = Math.abs(tX2 - tX1);
    const trimH = Math.abs(tY2 - tY1);
    if (trimW > 0 && trimH > 0 && (trimW < mediaW * 0.98 || trimH < mediaH * 0.98)) {
      return [Math.min(tX1, tX2), Math.min(tY1, tY2), Math.max(tX1, tX2), Math.max(tY1, tY2)];
    }
  }
  let cropLeft = 0.05,
    cropRight = 0.05,
    cropTop = 0.05,
    cropBottom = 0.05;
  const pageNumber = (page as any).pageNumber || 1;
  const isEvenPage = pageNumber % 2 === 0;
  cropLeft = Math.max(cropLeft, 0.05);
  cropRight = Math.max(cropRight, isEvenPage ? 0.07 : 0.05);
  cropTop = Math.max(cropTop, 0.05);
  cropBottom = Math.max(cropBottom, 0.05);
  return [
    mediaBox[0] + mediaW * cropLeft,
    mediaBox[1] + mediaH * cropBottom,
    mediaBox[2] - mediaW * cropRight,
    mediaBox[3] - mediaH * cropTop,
  ];
}

const pdfDocCache = new Map<string, Promise<pdfjsLib.PDFDocumentProxy>>();

export function getPdfDocument(url: string): Promise<pdfjsLib.PDFDocumentProxy> {
  const cached = pdfDocCache.get(url);
  if (cached) return cached;
  const loadingTask = pdfjsLib.getDocument({
    url: encodeURI(url),
    cMapUrl: "https://unpkg.com/pdfjs-dist@4.0.379/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "https://unpkg.com/pdfjs-dist@4.0.379/standard_fonts/",
    rangeChunkSize: 65536,
    disableAutoFetch: false,
    disableStream: false,
  });
  const promise = loadingTask.promise;
  pdfDocCache.set(url, promise);
  return promise;
}

const getTargetWidth = () =>
  typeof window !== "undefined" && window.innerWidth < 768 ? 600 : 1000;

function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  targetWidth?: number,
) {
  const tw = targetWidth ?? getTargetWidth();
  const renderKey = `${pageNum}_${tw}`;
  if (canvas.dataset.rendered === renderKey) return;
  canvas.dataset.rendered = "rendering";

  pdfDoc.getPage(pageNum).then((page) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const viewBox = getTrimBoxCrop(page);
    const liveW = viewBox[2] - viewBox[0];
    const scale = (tw / liveW) * dpr;
    const renderVp = page.getViewport({ scale, viewBox } as any);

    canvas.width = Math.round(renderVp.width);
    canvas.height = Math.round(renderVp.height);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    page.render({ canvasContext: ctx, viewport: renderVp }).promise.then(() => {
      canvas.dataset.rendered = renderKey;
    });
  });
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
export interface PdfBookViewerProps {
  pdfUrl?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

export const PdfBookViewer: React.FC<PdfBookViewerProps> = ({
  pdfUrl,
  title,
  isOpen,
  onClose,
  initialPage = 1,
}) => {
  const targetPdfUrl = pdfUrl || "/documents/weekly/32 Pages/10,11.pdf";
  // Extract book ID from URL or title for settings persistence
  const bookId = useMemo(() => btoa(targetPdfUrl).substring(0, 15), [targetPdfUrl]);

  const { settings, updateSettings } = useReaderSettings(bookId);
  const { pdf, totalPages, isLoading, error } = usePdfStreaming(targetPdfUrl);
  const { isCachedForOffline, toggleOfflineCache } = useOfflineCache(bookId);

  const { getInitialProgress } = useReadingProgress(
    bookId,
    1,
    totalPages,
    !isLoading && totalPages > 0,
  );

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const bookElementRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<any>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);

  // Use Custom Hooks for intelligent features
  useSmartPrefetch(pdf, currentPage, totalPages);
  useReadingProgress(bookId, currentPage, totalPages, !isLoading && totalPages > 0);

  // Load initial progress once PDF is loaded
  useEffect(() => {
    if (!isLoading && totalPages > 0) {
      const initial = getInitialProgress();
      setCurrentPage(initial);
      if (pageFlipRef.current && initial > 1) {
        // Delay jump slightly so PageFlip is ready
        setTimeout(() => pageFlipRef.current.flip(initial - 1), 100);
      }
    }
  }, [isLoading, totalPages]);

  // PageFlip Initialization and Responsive Updating
  const updateDimensions = useCallback(() => {
    if (!isOpen || !pdf || !pagesContainerRef.current || !containerRef.current || totalPages === 0)
      return;

    const container = containerRef.current;
    const containerW = container.clientWidth || window.innerWidth;
    const containerH = container.clientHeight || window.innerHeight - 44;

    pdf.getPage(1).then((page1) => {
      const viewBox = getTrimBoxCrop(page1);
      const paperW = viewBox[2] - viewBox[0];
      const paperH = viewBox[3] - viewBox[1];

      const isMobile = containerW < 768;
      const isTwoPageDoc = totalPages <= 2;
      const isSingleMode = isTwoPageDoc || isMobile || settings.readingMode === "single";
      const pagesInSpread = isSingleMode ? 1 : 2;

      const marginX = isMobile ? 20 : settings.showSidebar ? 340 : 140;
      const marginY = isMobile ? 20 : 44;
      const availW = Math.max(containerW - marginX, 260);
      const availH = Math.max(containerH - marginY, 300);

      const spreadPaperW = paperW * pagesInSpread;
      const scale = Math.min(availW / spreadPaperW, availH / paperH);
      const pageW = Math.round(paperW * scale);
      const pageH = Math.round(paperH * scale);

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
          maxShadowOpacity: 0.45,
          flippingTime: 600,
          showCover: totalPages > 2 && !isSingleMode,
          mobileScrollSupport: false,
          usePortrait: isSingleMode,
          autoCenter: true,
          startPage: currentPage - 1,
          swipeDistance: 50, // Increase swipe distance to reduce mistouches
        });

        const pageElements = pagesContainerRef.current!.querySelectorAll(".st-page");
        if (pageElements.length > 0) {
          pageFlip.loadFromHTML(pageElements as any);
          pageFlipRef.current = pageFlip;
          pageFlip.on("flip", (e: any) => {
            const newPage = (e.data as number) + 1;
            setCurrentPage(newPage);
            playPaperFlipSound(settings.isMuted);
          });
        }
      } else {
        try {
          pageFlipRef.current.update({
            width: pageW,
            height: pageH,
            usePortrait: isSingleMode,
            showCover: totalPages > 2 && !isSingleMode,
          });
        } catch {}
      }
    });
  }, [isOpen, pdf, totalPages, settings.isMuted, settings.readingMode, settings.showSidebar]);

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
  }, [isOpen, pdf, totalPages]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen, updateDimensions]);

  // VIRTUALIZATION ENGINE: Only render canvases for active window, destroy rest to save Memory
  useEffect(() => {
    if (!pdf || totalPages === 0 || !pagesContainerRef.current) return;

    // Active sliding window: +/- 4 pages to keep upcoming pages in DOM during 3D flip animation
    const activeWindow = new Set(
      [
        currentPage - 4,
        currentPage - 3,
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
        currentPage + 3,
        currentPage + 4,
      ].filter((p) => p >= 1 && p <= totalPages),
    );

    const container = pagesContainerRef.current;

    // Inject or render active canvases
    activeWindow.forEach((p) => {
      const canvas = container.querySelector(`canvas[data-page="${p}"]`) as HTMLCanvasElement;
      if (
        canvas &&
        canvas.dataset.rendered !== "rendering" &&
        !canvas.dataset.rendered?.includes(`${p}_`)
      ) {
        renderPdfPageToCanvas(pdf, p, canvas);
      }
    });

    // Clear inactive canvases to free WebGL/Canvas memory footprint
    const allCanvases = container.querySelectorAll("canvas[data-page]");
    allCanvases.forEach((canvas) => {
      const p = parseInt(canvas.getAttribute("data-page") || "0", 10);
      if (p > 0 && !activeWindow.has(p)) {
        const c = canvas as HTMLCanvasElement;
        if (c.width !== 0 || c.height !== 0) {
          c.width = 0;
          c.height = 0;
          c.dataset.rendered = "";
        }
      }
    });
  }, [pdf, totalPages, currentPage]);

  const handlePrev = useCallback(() => {
    if (pageFlipRef.current) pageFlipRef.current.flipPrev("side");
  }, []);

  const handleNext = useCallback(() => {
    if (pageFlipRef.current) pageFlipRef.current.flipNext("side");
  }, []);

  const jumpToPage = (pageNum: number) => {
    if (pageFlipRef.current && pageNum >= 1 && pageNum <= totalPages) {
      pageFlipRef.current.flip(pageNum - 1);
    }
  };

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

  // Zoom Engine / Dragging (Mouse & Touch)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      updateSettings({ zoomLevel: Math.min(Math.max(0.5, settings.zoomLevel + delta), 3.0) });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (settings.zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && settings.zoomLevel > 1) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (settings.zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && settings.zoomLevel > 1 && e.touches.length === 1) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!isOpen) return null;

  const getCenterTransform = () =>
    `scale(${settings.zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col text-stone-100 select-none overflow-hidden font-sans ${
        settings.theme === "dark" ? "bg-[#0d0b0a]" : "bg-stone-200"
      }`}
    >
      {settings.showToolbar && (
        <ReaderToolbar
          title={title}
          currentPage={currentPage}
          totalPages={totalPages}
          settings={settings}
          updateSettings={updateSettings}
          onPrev={handlePrev}
          onNext={handleNext}
          onJump={jumpToPage}
          onClose={onClose}
          onToggleSidebar={() => updateSettings({ showSidebar: !settings.showSidebar })}
          onToggleOffline={() => toggleOfflineCache(targetPdfUrl)}
          isCachedOffline={isCachedForOffline}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        <ReaderSidebar
          isOpen={settings.showSidebar}
          onClose={() => updateSettings({ showSidebar: false })}
          onJump={jumpToPage}
        />

        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}
          className={`flex-1 relative flex items-center justify-center overflow-hidden w-full h-full touch-none ${
            settings.zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          style={{
            background:
              settings.theme === "dark"
                ? "radial-gradient(circle at 50% 50%, #1c1917 0%, #12100e 55%, #080706 100%)"
                : "radial-gradient(circle at 50% 50%, #f5f5f4 0%, #e7e5e4 100%)",
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-amber-500/80 text-sm font-medium tracking-wider uppercase animate-pulse">
                Initializing Streaming Engine...
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded max-w-sm text-center">
                <p className="font-bold mb-2">Error Loading Document</p>
                <p className="text-sm opacity-80">{error.message}</p>
              </div>
            </div>
          )}

          <button
            onClick={handlePrev}
            disabled={currentPage <= 1 || isLoading}
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-stone-900/85 hover:bg-amber-600 text-stone-200 hover:text-white border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all duration-200 opacity-75 hover:opacity-100 disabled:opacity-0 hover:scale-110 active:scale-95 cursor-pointer hidden md:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages || isLoading}
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-stone-900/85 hover:bg-amber-600 text-stone-200 hover:text-white border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all duration-200 opacity-75 hover:opacity-100 disabled:opacity-0 hover:scale-110 active:scale-95 cursor-pointer hidden md:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            ref={bookElementRef}
            className={`relative transition-transform duration-300 ease-out flex items-center justify-center m-auto ${isLoading ? "opacity-0" : "opacity-100"}`}
            style={{ transform: getCenterTransform() }}
          >
            <div
              ref={pagesContainerRef}
              className="st-flip-book relative rounded-[2px] transition-shadow duration-300"
              style={{
                boxShadow:
                  settings.theme === "dark"
                    ? "0 30px 60px -12px rgba(0, 0, 0, 0.75), 0 15px 30px -8px rgba(0, 0, 0, 0.55)"
                    : "0 30px 60px -12px rgba(0, 0, 0, 0.15), 0 15px 30px -8px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Virtualized DOM nodes */}
              {Array.from({ length: totalPages }).map((_, idx) => (
                <div
                  key={idx + 1}
                  data-page={idx + 1}
                  className="st-page bg-[#fdfcfa] overflow-hidden relative select-none rounded-[1px]"
                  data-density="soft"
                >
                  <canvas
                    data-page={idx + 1}
                    className="w-full h-full object-contain mx-auto block absolute inset-0 z-0"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
                  />
                  {/* Book spine crease shadow with middle line */}
                  <div 
                    className={`absolute inset-y-0 w-6 md:w-16 z-10 pointer-events-none mix-blend-multiply ${
                      (idx + 1) % 2 === 0
                        ? "right-0 bg-gradient-to-l from-black/25 to-transparent border-r border-black/30"
                        : "left-0 bg-gradient-to-r from-black/25 to-transparent border-l border-black/30"
                    }`}
                  />
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-stone-900/60 text-stone-300 text-[9px] font-mono px-2 py-0.5 rounded-full pointer-events-none z-10 border border-stone-700/40 backdrop-blur-sm opacity-80">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
