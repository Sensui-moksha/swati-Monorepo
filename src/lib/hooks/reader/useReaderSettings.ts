import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "sepia";
export type ReadingMode = "single" | "double" | "scroll";
export type AnimationPref = "flip" | "slide" | "none";

export interface ReaderSettings {
  zoomLevel: number;
  theme: Theme;
  readingMode: ReadingMode;
  animationPref: AnimationPref;
  showSidebar: boolean;
  showToolbar: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  zoomLevel: 1,
  theme: "dark",
  readingMode: "double",
  animationPref: "flip",
  showSidebar: false,
  showToolbar: true,
  isFullscreen: false,
  isMuted: false,
};

export function useReaderSettings(bookId: string) {
  const [settings, setSettingsState] = useState<ReaderSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(`reader_settings_${bookId}`);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      const globalStored = localStorage.getItem(`reader_settings_global`);
      if (globalStored) return { ...DEFAULT_SETTINGS, ...JSON.parse(globalStored) };
    } catch {
      // Ignored
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (updates: Partial<ReaderSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem(`reader_settings_${bookId}`, JSON.stringify(next));
        // Persist global prefs for other books (like theme, animation, mute)
        const globalPrefs = {
          theme: next.theme,
          animationPref: next.animationPref,
          isMuted: next.isMuted,
        };
        localStorage.setItem(`reader_settings_global`, JSON.stringify(globalPrefs));
      }
      return next;
    });
  };

  return { settings, updateSettings };
}
