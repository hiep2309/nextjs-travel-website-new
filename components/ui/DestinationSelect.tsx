"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import { normalizeVietnameseText } from "@/lib/normalizeVn";

type Props = {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  noResultText: string;
  clearLabel: string;
  /** Allow committing free text not present in options (Enter in search). */
  allowCustom?: boolean;
};

export default function DestinationSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  noResultText,
  clearLabel,
  allowCustom = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const id = window.setTimeout(() => searchRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = normalizeVietnameseText(query);
    if (!q) return options;
    return options.filter((o) => normalizeVietnameseText(o).includes(q));
  }, [options, query]);

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-left text-sm outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25"
      >
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" aria-hidden />
        <span className={`flex-1 truncate ${value ? "text-white" : "text-white/35"}`}>
          {value || placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={clearLabel}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
              }
            }}
            className="rounded-md p-0.5 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" aria-hidden />
          </span>
        ) : null}
        <ChevronDown
          className={`size-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
            role="listbox"
          >
            <div className="border-b border-white/10 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" aria-hidden />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && allowCustom && query.trim()) {
                      e.preventDefault();
                      select(query.trim());
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-8 pr-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500/50"
                />
              </div>
            </div>

            <ul className="custom-scrollbar max-h-60 overflow-y-auto overscroll-contain p-1.5">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-white/40">{noResultText}</li>
              ) : (
                filtered.map((opt) => {
                  const selected = opt === value;
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => select(opt)}
                        role="option"
                        aria-selected={selected}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                          selected
                            ? "bg-violet-600/25 font-semibold text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {selected ? <Check className="size-4 shrink-0 text-violet-300" aria-hidden /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
