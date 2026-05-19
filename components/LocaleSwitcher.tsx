"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ChevronDown, Globe, Check } from "lucide-react";
import { localeLabels, locales, type AppLocale } from "@/i18n/routing";

/**
 * Glassmorphism locale switcher — preserves current path when changing language.
 */
export default function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchLocale = (next: AppLocale) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    startTransition(() => {
      router.replace(pathname, { locale: next });
      setOpen(false);
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/90 px-2.5 py-2 text-white shadow-lg shadow-black/30 backdrop-blur-md transition hover:border-violet-400/40 hover:bg-slate-900 disabled:opacity-60"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Change language"
        disabled={pending}
      >
        <Globe className="size-4 text-violet-300" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wide">{locale}</span>
        <ChevronDown className={`size-3.5 text-white/60 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-[1002] mt-2 min-w-[10.5rem] overflow-hidden rounded-xl border border-white/15 bg-slate-950 p-1 shadow-2xl shadow-black/50"
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => switchLocale(code)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-violet-600/30 font-semibold text-white"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <span>{localeLabels[code]}</span>
                  {active ? <Check className="size-4 text-violet-300" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
