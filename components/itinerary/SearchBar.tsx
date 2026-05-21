"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function ItinerarySearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[44px] rounded-2xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
      />
    </div>
  );
}
