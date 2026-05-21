"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ChevronDown, Globe, Check } from "lucide-react";
import { LOCALE_COOKIE, localeLabels, locales, type AppLocale } from "@/i18n/routing";

const localeFlags: Record<AppLocale, string> = {
  vi: "🇻🇳",
  en: "🇺🇸",
  ko: "🇰🇷",
};

/**
 * Premium glassmorphism locale switcher — preserves route, persists cookie, animated dropdown.
 */
export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("LocaleSwitcher");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
  }, []);

  const persistLocale = (next: AppLocale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  const switchLocale = (next: AppLocale) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    persistLocale(next);
    startTransition(() => {
      router.replace(pathname, { locale: next });
      setOpen(false);
    });
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.97 }}
        className="flex min-h-[44px] min-w-[4.5rem] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/85 px-2.5 py-2 text-white shadow-lg shadow-black/30 backdrop-blur-md transition hover:border-violet-400/40 hover:bg-slate-900/95 disabled:opacity-60 sm:min-h-[40px]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("aria")}
        disabled={pending}
      >
        <Globe className="size-4 shrink-0 text-violet-300" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wide">{locale}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-white/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1001] bg-black/20 backdrop-blur-[2px] sm:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute right-0 top-full z-[1002] mt-2 min-w-[11.5rem] overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              {locales.map((code) => {
                const active = code === locale;
                return (
                  <li key={code} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => switchLocale(code)}
                      disabled={pending}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition touch-manipulation ${
                        active
                          ? "bg-violet-600/30 font-semibold text-white ring-1 ring-violet-400/30"
                          : "text-white/90 hover:bg-white/10 active:bg-white/15"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none" aria-hidden>
                          {localeFlags[code]}
                        </span>
                        <span>{localeLabels[code]}</span>
                      </span>
                      {active ? <Check className="size-4 shrink-0 text-violet-300" aria-hidden /> : null}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
