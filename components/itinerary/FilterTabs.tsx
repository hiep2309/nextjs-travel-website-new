"use client";

import type { TravelStyle } from "@/lib/planner/types";

export type StyleFilter = "all" | TravelStyle;

type Props = {
  value: StyleFilter;
  onChange: (value: StyleFilter) => void;
  labels: Record<StyleFilter, string>;
};

const FILTERS: StyleFilter[] = ["all", "Chill", "Adventure", "Food", "Luxury", "Culture"];

export default function FilterTabs({ value, onChange, labels }: Props) {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition touch-manipulation sm:text-sm ${
            value === key
              ? "bg-violet-600/50 text-white ring-1 ring-violet-400/50"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  );
}
