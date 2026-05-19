/**
 * Thanh tìm kiếm toàn trang — gợi ý 34 tỉnh/thành (2025), Enter ưu tiên điểm đến hoặc /explore?q=.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MapPin, Search } from "lucide-react";
import { normalizeVietnameseText } from "@/lib/normalizeVn";
import { provinceNameToSlug } from "@/lib/provinceSlug";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";

const SUGGEST_LIMIT = 8;

export default function SiteSearchBar() {
  const t = useTranslations("Search");
  const tc = useTranslations("Common");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const needle = useMemo(() => normalizeVietnameseText(value.trim()), [value]);

  const provinceSuggestions = useMemo(() => {
    if (!needle) return [];
    const scored = VIETNAM_PROVINCES.map((p) => {
      const nameN = normalizeVietnameseText(p.name);
      const regionN = normalizeVietnameseText(p.region);
      let score = 0;
      if (nameN === needle) score = 100;
      else if (nameN.startsWith(needle)) score = 80;
      else if (nameN.includes(needle)) score = 60;
      else if (regionN.includes(needle)) score = 40;
      else if (needle.length >= 2 && needle.includes(nameN.split(" ")[0] ?? "")) score = 25;
      return { p, score };
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, SUGGEST_LIMIT)
      .map((x) => x.p);
    return scored;
  }, [needle]);

  const navigateForQuery = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      const n = normalizeVietnameseText(q);
      const exact = VIETNAM_PROVINCES.find((p) => normalizeVietnameseText(p.name) === n);
      if (exact) {
        router.push(`/destinations/${provinceNameToSlug(exact.name)}`);
        return;
      }
      const matches = VIETNAM_PROVINCES.filter((p) => {
        const pn = normalizeVietnameseText(p.name);
        const pr = normalizeVietnameseText(p.region);
        return pn.includes(n) || pr.includes(n) || (n.length >= 3 && n.includes(pn));
      });
      if (matches.length === 1) {
        router.push(`/destinations/${provinceNameToSlug(matches[0]!.name)}`);
        return;
      }
      router.push(`/explore?q=${encodeURIComponent(q)}`);
    },
    [router],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigateForQuery(value);
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-xl mx-auto">
      <form
        onSubmit={onSubmit}
        className="flex w-full items-center gap-3 rounded-full border border-white/25 bg-black/35 px-4 py-3 shadow-xl backdrop-blur-xl ring-1 ring-white/10 transition focus-within:border-white/40 focus-within:ring-white/20 sm:px-5 sm:py-3.5"
        role="search"
        aria-label={t("aria")}
      >
        <Search className="size-5 shrink-0 text-white/55" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-white placeholder:text-white/45 outline-none focus:ring-0"
          autoComplete="off"
          id="site-search-input"
          aria-controls="site-search-suggestions"
        />
        <button
          type="submit"
          className="hidden shrink-0 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25 sm:inline"
        >
          {tc("search")}
        </button>
      </form>

      {open && value.trim() && provinceSuggestions.length > 0 ? (
        <ul
          id="site-search-suggestions"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(60vh,320px)] overflow-auto rounded-2xl border border-white/20 bg-slate-950/95 py-2 shadow-2xl backdrop-blur-xl"
          role="listbox"
          aria-label={t("provinceSuggestions")}
        >
          {provinceSuggestions.map((p) => (
            <li key={p.name} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected="false"
                className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10"
                onClick={() => {
                  setValue(p.name);
                  setOpen(false);
                  router.push(`/destinations/${provinceNameToSlug(p.name)}`);
                }}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-amber-400/90" aria-hidden />
                <span>
                  <span className="font-semibold">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-white/55">{p.region}</span>
                </span>
              </button>
            </li>
          ))}
          <li className="border-t border-white/10 px-4 py-2">
            <button
              type="button"
              className="w-full rounded-lg py-2 text-center text-xs font-medium text-amber-200/95 hover:bg-white/5"
              onClick={() => {
                setOpen(false);
                navigateForQuery(value);
              }}
            >
              {t("explorePosts", { q: value.trim() })}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
