"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PUBLIC_HEROES } from "@/lib/publicAssets";
import { useAuth } from "@/hooks/useAuth";
import { useSavedItineraries } from "@/hooks/useSavedItineraries";
import {
  getItineraryDestination,
  getItineraryTitle,
} from "@/lib/itinerary/display";
import type { ItinerarySort } from "@/lib/itinerary/types";
import EmptyState from "@/components/itinerary/EmptyState";
import FilterTabs, { type StyleFilter } from "@/components/itinerary/FilterTabs";
import ItinerarySearchBar from "@/components/itinerary/SearchBar";
import SavedItineraryGrid from "@/components/itinerary/SavedItineraryGrid";

export default function SavedItinerariesClient() {
  const t = useTranslations("SavedItineraries");
  const locale = useLocale() as AppLocale;
  const { user } = useAuth();
  const { items, loading, error, remove } = useSavedItineraries(user?.uid);

  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("all");
  const [sort, setSort] = useState<ItinerarySort>("newest");
  const [view, setView] = useState<"grid" | "list">("list");

  const filterLabels: Record<StyleFilter, string> = {
    all: t("filterAll"),
    Chill: t("style_Chill"),
    Adventure: t("style_Adventure"),
    Food: t("style_Food"),
    Luxury: t("style_Luxury"),
    Culture: t("style_Culture"),
  };

  const filtered = useMemo(() => {
    let rows = [...items];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((item) => {
        const title = getItineraryTitle(item, locale).toLowerCase();
        const dest = getItineraryDestination(item, locale).toLowerCase();
        return title.includes(q) || dest.includes(q);
      });
    }
    if (styleFilter !== "all") {
      rows = rows.filter((item) => item.travelStyle === styleFilter);
    }
    rows.sort((a, b) => {
      if (sort === "oldest") return a.updatedAt.getTime() - b.updatedAt.getTime();
      if (sort === "durationAsc") return a.duration - b.duration;
      if (sort === "durationDesc") return b.duration - a.duration;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    return rows;
  }, [items, search, styleFilter, sort, locale]);

  return (
    <div className="relative min-h-[100dvh] pb-20 pt-20 text-white sm:pt-24">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url('${PUBLIC_HEROES.appBackground}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/98"
        aria-hidden
      />

      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/80">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{t("title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/55 sm:text-base">{t("subtitle")}</p>
          </div>
          <Link
            href="/ai-trip-planner"
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-blue-500"
          >
            <Plus className="size-4" />
            {t("createNew")}
          </Link>
        </header>

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <ItinerarySearchBar value={search} onChange={setSearch} placeholder={t("searchPh")} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ItinerarySort)}
              className="min-h-[44px] rounded-2xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-500/40"
            >
              <option value="newest">{t("sortNewest")}</option>
              <option value="oldest">{t("sortOldest")}</option>
              <option value="durationDesc">{t("sortDurationDesc")}</option>
              <option value="durationAsc">{t("sortDurationAsc")}</option>
            </select>
            <div className="flex shrink-0 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-xl p-2.5 ${view === "list" ? "bg-violet-600/40 text-white" : "text-white/50"}`}
                aria-label={t("viewList")}
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-xl p-2.5 ${view === "grid" ? "bg-violet-600/40 text-white" : "text-white/50"}`}
                aria-label={t("viewGrid")}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>
          <FilterTabs value={styleFilter} onChange={setStyleFilter} labels={filterLabels} />
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <SavedItineraryGrid
            items={filtered}
            loading={loading}
            view={view}
            onDelete={remove}
          />
        )}

        {!loading && items.length > 0 ? (
          <p className="mt-6 flex items-center gap-2 text-xs text-white/40">
            <Sparkles className="size-3.5 text-violet-400" />
            {t("count", { count: filtered.length })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
