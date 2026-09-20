import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Filter, X } from "lucide-react";

export interface DateFilterValue {
  preset: string; // 'all' | '2026' | '2025' | '2024' | 'custom'
  startDate?: string;
  endDate?: string;
}

interface DateFilterControlProps {
  value: DateFilterValue;
  onChange: (newValue: DateFilterValue) => void;
  className?: string;
  compact?: boolean;
}

export function isItemInDateRange<T>(
  item: T,
  getDate: (item: T) => string | undefined | null,
  filter: DateFilterValue,
): boolean {
  if (filter.preset === "all") return true;
  const rawDate = getDate(item);
  if (!rawDate) return true;

  const date = new Date(rawDate);
  if (isNaN(date.getTime())) return true;

  if (filter.preset === "custom") {
    if (filter.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      if (date < start) return false;
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
    return true;
  }

  const year = date.getFullYear().toString();
  if (filter.preset === "earlier") {
    return parseInt(year, 10) <= 2024;
  }
  return year === filter.preset;
}

const PRESETS = [
  { label: "All Dates", value: "all" },
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024 & Earlier", value: "earlier" },
  { label: "Custom Range...", value: "custom" },
];

export const DateFilterControl: React.FC<DateFilterControlProps> = ({
  value,
  onChange,
  className = "",
  compact = false,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(value.preset === "custom");

  const handlePresetSelect = (presetVal: string) => {
    if (presetVal === "custom") {
      setShowCustomPicker(true);
      onChange({ ...value, preset: "custom" });
    } else {
      setShowCustomPicker(false);
      onChange({ preset: presetVal, startDate: undefined, endDate: undefined });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, preset: "custom", startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, preset: "custom", endDate: e.target.value });
  };

  const clearFilter = () => {
    setShowCustomPicker(false);
    onChange({ preset: "all" });
  };

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
          <span>Date:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {PRESETS.map((p) => {
            const isActive = value.preset === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => handlePresetSelect(p.value)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "bg-secondary/60 hover:bg-secondary border border-rule text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}

          {value.preset !== "all" && (
            <button
              type="button"
              onClick={clearFilter}
              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition"
              title="Reset date filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {(showCustomPicker || value.preset === "custom") && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rule/50 text-xs">
          <div className="flex items-center gap-1.5 bg-paper border border-rule rounded-lg px-2.5 py-1">
            <span className="text-muted-foreground font-medium">From:</span>
            <input
              type="date"
              value={value.startDate || ""}
              onChange={handleStartDateChange}
              className="bg-transparent outline-none text-foreground font-sans text-xs cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-paper border border-rule rounded-lg px-2.5 py-1">
            <span className="text-muted-foreground font-medium">To:</span>
            <input
              type="date"
              value={value.endDate || ""}
              onChange={handleEndDateChange}
              className="bg-transparent outline-none text-foreground font-sans text-xs cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
