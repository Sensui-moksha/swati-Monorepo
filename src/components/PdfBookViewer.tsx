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
  const [totalPages] = useState(5);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const targetPdfUrl = pdfUrl || "/documents/sample-issue.pdf";

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-stone-950 text-stone-100 animate-in fade-in duration-200">
      {/* Top Custom Reader Header */}
      <header className="flex h-14 items-center justify-between border-b border-stone-800 bg-stone-900/90 px-4 md:px-6 select-none shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-sm md:text-base font-semibold text-stone-100">
              {title}
            </h2>
            <p className="text-xs text-stone-400">Swathi Single-Page Document View</p>
          </div>
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Previous Page
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-stone-800/80 text-xs font-mono text-stone-200">
            <span>Page</span>
            <span className="font-bold text-primary text-sm">{currentPage}</span>
            <span>of {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            Next Page <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tools Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-stone-800 rounded p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(70, z - 15))}
              className="p-1.5 hover:bg-stone-700 rounded transition-colors text-stone-300"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-mono text-stone-300">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(160, z + 15))}
              className="p-1.5 hover:bg-stone-700 rounded transition-colors text-stone-300"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <a
            href={targetPdfUrl}
            download
            className="p-2 hover:bg-stone-800 rounded transition-colors text-stone-300 hover:text-white"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-stone-800 rounded transition-colors text-stone-300 hover:text-white"
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
            title="Close Viewer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Single Page Document Display Area */}
      <div className="flex-1 overflow-auto bg-stone-900 p-4 md:p-8 flex items-center justify-center relative">
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center w-full max-w-4xl"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Single Page Frame */}
          <div className="relative shadow-2xl rounded-xl bg-white border border-stone-700/80 w-full h-[82vh] overflow-hidden">
            <object
              data={`${targetPdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              className="w-full h-full border-0"
            >
              <embed
                src={`${targetPdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="w-full h-full border-0"
              />
            </object>

            {/* Custom Reader Watermark Badge */}
            <div className="absolute bottom-4 right-4 bg-stone-950/80 backdrop-blur border border-stone-700 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl pointer-events-none">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Swathi Single-Page View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
