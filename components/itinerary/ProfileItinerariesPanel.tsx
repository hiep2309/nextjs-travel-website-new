"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
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

type Props = {
  userId: string;
};

export default function ProfileItinerariesPanel({ userId }: Props) {
  const t = useTranslations("SavedItineraries");
  const tProfile = useTranslations("Profile");
  const locale = useLocale() as AppLocale;
  const { items, loading, error, remove } = useSavedItineraries(userId);

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
    <div className="mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{t("title")}</h2>
          <p className="mt-1 text-sm text-white/55">{tProfile("itinerariesDesc")}</p>
        </div>
        <Link
          href="/ai-trip-planner"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-violet-500"
        >
          <Plus className="size-4" />
          {t("createNew")}
        </Link>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <ItinerarySearchBar value={search} onChange={setSearch} placeholder={t("searchPh")} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ItinerarySort)}
            className="min-h-[44px] rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-500/40"
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="oldest">{t("sortOldest")}</option>
            <option value="durationDesc">{t("sortDurationDesc")}</option>
            <option value="durationAsc">{t("sortDurationAsc")}</option>
          </select>
          <div className="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-lg p-2.5 ${view === "list" ? "bg-violet-600/40 text-white" : "text-white/50"}`}
              aria-label={t("viewList")}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-lg p-2.5 ${view === "grid" ? "bg-violet-600/40 text-white" : "text-white/50"}`}
              aria-label={t("viewGrid")}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <FilterTabs value={styleFilter} onChange={setStyleFilter} labels={filterLabels} />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-6">
          <SavedItineraryGrid items={filtered} loading={loading} view={view} onDelete={remove} />
        </div>
      )}

      {!loading && items.length > 0 ? (
        <p className="mt-4 text-xs text-white/40">{t("count", { count: filtered.length })}</p>
      ) : null}
    </div>
  );
}
