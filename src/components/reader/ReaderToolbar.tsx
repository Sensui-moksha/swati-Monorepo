import React from "react";
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
  Menu,
  DownloadCloud
} from "lucide-react";
import { ReaderSettings } from "@/lib/hooks/reader/useReaderSettings";

interface ReaderToolbarProps {
  title: string;
  currentPage: number;
  totalPages: number;
  settings: ReaderSettings;
  updateSettings: (s: Partial<ReaderSettings>) => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (page: number) => void;
  onClose: () => void;
  onToggleSidebar: () => void;
  onToggleOffline: () => void;
  isCachedOffline: boolean;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  title,
  currentPage,
  totalPages,
  settings,
  updateSettings,
  onPrev,
  onNext,
  onJump,
  onClose,
  onToggleSidebar,
  onToggleOffline,
  isCachedOffline,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      updateSettings({ isFullscreen: true });
    } else {
      document.exitFullscreen().catch(() => {});
      updateSettings({ isFullscreen: false });
    }
  };

  return (
    <header className="flex h-11 items-center justify-between border-b border-stone-800/80 bg-stone-900/95 px-3 z-50 shrink-0 shadow-md">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
          title="Toggle Sidebar (Table of Contents / Bookmarks)"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="h-7 w-7 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 grid place-items-center shrink-0 shadow-inner">
          <BookOpen className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 hidden sm:block">
          <h2 className="truncate font-serif text-xs font-semibold text-stone-100 tracking-wide">
            {title}
          </h2>
        </div>
      </div>

      {/* Page counter display */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="p-1 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition disabled:opacity-20"
          title="Previous Page (Left Arrow)"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800/90 text-xs font-mono border border-stone-700/60 shadow-inner">
          <span className="text-stone-400 text-[11px] hidden sm:inline">Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => onJump(parseInt(e.target.value, 10) || 1)}
            className="w-8 text-center bg-stone-950 text-amber-400 font-bold text-xs rounded border border-stone-700 outline-none focus:border-amber-500"
          />
          <span className="text-stone-400 text-[11px]">of {totalPages || "…"}</span>
        </div>
        <button
          onClick={onNext}
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
          onClick={onToggleOffline}
          className={`p-1.5 rounded transition ${isCachedOffline ? "text-amber-400" : "text-stone-500 hover:text-stone-300"}`}
          title={isCachedOffline ? "Available Offline" : "Download for Offline Reading"}
        >
          <DownloadCloud className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => updateSettings({ isMuted: !settings.isMuted })}
          className={`p-1.5 rounded transition hidden sm:block ${settings.isMuted ? "text-stone-500 hover:text-stone-300" : "text-amber-400 hover:bg-stone-800"}`}
          title={settings.isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {settings.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <div className="h-3.5 w-px bg-stone-800 mx-1 hidden sm:block" />

        <button
          onClick={() => updateSettings({ zoomLevel: Math.min(settings.zoomLevel + 0.25, 3.0) })}
          className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => updateSettings({ zoomLevel: Math.max(settings.zoomLevel - 0.25, 0.5) })}
          className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        {settings.zoomLevel !== 1 && (
          <button
            onClick={() => updateSettings({ zoomLevel: 1 })}
            className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition"
            title="Reset Zoom (Fit to Screen)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="h-3.5 w-px bg-stone-800 mx-1" />

        <button
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-stone-800 rounded text-stone-300 hover:text-white transition hidden sm:block"
          title="Toggle Fullscreen"
        >
          {settings.isFullscreen ? (
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
  );
};
