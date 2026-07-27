import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Download,
  X,
  BookOpen,
  FileText,
} from "lucide-react";

interface PdfBookViewerProps {
  pdfUrl?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfBookViewer: React.FC<PdfBookViewerProps> = ({
  pdfUrl,
  title,
  isOpen,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(12); // Simulated digital book flip pages count
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"dual" | "single">("dual");

  if (!isOpen) return null;

  const targetPdfUrl = pdfUrl || "/documents/sample-issue.pdf";

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - (viewMode === "dual" ? 2 : 1)));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      Math.min(totalPages, prev + (viewMode === "dual" ? 2 : 1))
    );
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-stone-900 text-stone-100 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="flex h-14 items-center justify-between border-b border-stone-800 bg-stone-950 px-4 md:px-6 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-sm md:text-base font-semibold text-stone-100">
              {title}
            </h2>
            <p className="text-xs text-stone-400">Swathi Flipbook Digital Edition</p>
          </div>
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <div className="flex items-center gap-1 px-2 text-xs font-mono text-stone-300">
            <span>Page</span>
            <span className="font-bold text-primary">{currentPage}</span>
            {viewMode === "dual" && currentPage < totalPages && (
              <span>- {currentPage + 1}</span>
            )}
            <span>of {totalPages}</span>
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tools Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "dual" ? "single" : "dual")}
            className="hidden md:inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {viewMode === "dual" ? "Double Page" : "Single Page"}
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-stone-800 rounded p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(70, z - 15))}
              className="p-1 hover:bg-stone-700 rounded transition-colors text-stone-300"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono text-stone-400">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(160, z + 15))}
              className="p-1 hover:bg-stone-700 rounded transition-colors text-stone-300"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <a
            href={targetPdfUrl}
            download
            className="p-1.5 hover:bg-stone-800 rounded transition-colors text-stone-300 hover:text-white"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-stone-800 rounded transition-colors text-stone-300 hover:text-white"
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
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 hover:bg-red-600 text-stone-300 hover:text-white transition-colors"
            title="Close Book Viewer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Book Reader Frame Container */}
      <div className="flex-1 overflow-auto bg-stone-900/90 p-4 md:p-8 flex items-center justify-center relative">
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Flipbook Styled Book Container */}
          <div className="relative shadow-2xl rounded-lg bg-stone-800 p-2 md:p-4 border border-stone-700/60 max-w-5xl w-full flex items-center justify-center">
            {/* Book Spine Shadow Effect */}
            {viewMode === "dual" && (
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/40 via-black/10 to-black/40 z-20 pointer-events-none" />
            )}

            {/* Embedded PDF Canvas / Viewer */}
            <div className="w-full h-[75vh] rounded bg-white shadow-inner overflow-hidden flex items-center justify-center relative">
              <iframe
                src={`${targetPdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
                className="w-full h-full border-0"
                title={`Book View - ${title}`}
              />

              {/* PDF Fallback Reader Layer */}
              <div className="absolute bottom-4 right-4 bg-stone-900/80 backdrop-blur border border-stone-700 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Interactive Flipbook Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
