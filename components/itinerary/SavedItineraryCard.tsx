"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  MapPin,
  MoreVertical,
  Pencil,
  Share2,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import {
  formatItineraryDate,
  getItineraryDestination,
  getItinerarySummary,
  getItineraryTitle,
} from "@/lib/itinerary/display";
import type { SavedItineraryRecord } from "@/lib/itinerary/types";

type Props = {
  item: SavedItineraryRecord;
  index: number;
  view: "grid" | "list";
  onDelete: (id: string) => void;
};

const STATUS_STYLES = {
  planning: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
  completed: "bg-emerald-500/20 text-emerald-100 ring-emerald-400/30",
  draft: "bg-violet-500/20 text-violet-100 ring-violet-400/30",
} as const;

export default function SavedItineraryCard({ item, index, view, onDelete }: Props) {
  const t = useTranslations("SavedItineraries");
  const locale = useLocale() as AppLocale;
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title = getItineraryTitle(item, locale);
  const destination = getItineraryDestination(item, locale);
  const summary = getItinerarySummary(item, locale);
  const styleLabel = t(`style_${item.travelStyle}` as "style_Chill");
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.planning;

  const handleShare = async () => {
    const text = `${title}\n${destination}\n${item.plan.total_estimated_cost}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const isList = view === "list";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className={`group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-violet-400/30 hover:shadow-violet-950/20 ${
        isList ? "flex flex-col sm:flex-row" : "flex flex-col"
      }`}
    >
      <Link
        href={`/saved-itineraries/${item.id}`}
        className={`relative shrink-0 overflow-hidden ${isList ? "sm:w-72" : "w-full"}`}
      >
        <div className={`relative ${isList ? "aspect-[16/10] sm:h-full sm:min-h-[200px]" : "aspect-[16/10]"}`}>
          <Image
            src={item.coverImage}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes={isList ? "288px" : "(max-width:768px) 100vw, 33vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${statusStyle}`}
          >
            {t(`status_${item.status}`)}
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-violet-200 ring-1 ring-violet-400/30 backdrop-blur-md">
            <Sparkles className="size-3" />
            AI
          </span>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/saved-itineraries/${item.id}`} className="block">
              <h3 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-violet-100">
                {title}
              </h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-white/55">{summary}</p>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label={t("moreActions")}
            >
              <MoreVertical className="size-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 py-1 shadow-xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  <Share2 className="size-4" /> {t("share")}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="size-4" /> {t("delete")}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-violet-300" />
            {destination}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5 text-violet-300" />
            {item.duration} {t("daysShort")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5 text-violet-300" />
            {item.travelers}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="size-3.5 text-violet-300" />
            {item.budget}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-200 ring-1 ring-violet-400/20">
            {styleLabel}
          </span>
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60 ring-1 ring-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-auto pt-4 text-[11px] text-white/40">
          {t("createdAt", { date: formatItineraryDate(item.createdAt, locale) })}
        </p>

        <div className={`mt-3 grid gap-2 ${isList ? "sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"}`}>
          <Link
            href={`/saved-itineraries/${item.id}`}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/20"
          >
            {t("open")} <ChevronRight className="size-3.5" />
          </Link>
          <Link
            href={`/ai-trip-planner?itinerary=${item.id}`}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10"
          >
            <Pencil className="size-3.5" /> {t("continue")}
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-red-400/25 bg-red-500/10 px-3 text-xs font-semibold text-red-200 transition hover:bg-red-500/15"
          >
            <Trash2 className="size-3.5" /> {t("delete")}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
