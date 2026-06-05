"use client";

import { Heart, MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Dish } from "@/lib/food/types";

type Props = {
  dish: Dish;
  saved: boolean;
  inTrip: boolean;
  busy?: boolean;
  onSave: () => void;
  onAddToTrip: () => void;
  onViewLocation: () => void;
  compact?: boolean;
};

export default function FoodCardActions({
  dish,
  saved,
  inTrip,
  busy,
  onSave,
  onAddToTrip,
  onViewLocation,
  compact,
}: Props) {
  const t = useTranslations("SavedFoods");

  const btn = compact
    ? "inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-bold transition disabled:opacity-50 touch-manipulation"
    : "inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-50 touch-manipulation sm:text-sm";

  const wrap = compact ? "flex flex-col gap-1.5" : "flex flex-col gap-2 sm:flex-row";

  return (
    <div className={wrap} data-dish-id={dish.id} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave();
        }}
        className={`${btn} ${
          saved
            ? "border-pink-400/40 bg-pink-500/20 text-pink-100"
            : "border-white/15 bg-white/5 text-white hover:border-pink-400/30 hover:bg-pink-500/10"
        }`}
        aria-pressed={saved}
      >
        <Heart className={`size-3.5 shrink-0 ${saved ? "fill-current" : ""}`} aria-hidden />
        {saved ? t("actionSaved") : t("actionSave")}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToTrip();
        }}
        className={`${btn} ${
          inTrip
            ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
            : "border-white/15 bg-white/5 text-white hover:border-emerald-400/30 hover:bg-emerald-500/10"
        }`}
        aria-pressed={inTrip}
      >
        <Plus className="size-3.5 shrink-0" aria-hidden />
        {inTrip ? t("actionInTrip") : t("actionAddToTrip")}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onViewLocation();
        }}
        className={`${btn} border-white/15 bg-white/5 text-white hover:border-violet-400/30 hover:bg-violet-500/10`}
      >
        <MapPin className="size-3.5 shrink-0" aria-hidden />
        {t("actionViewLocation")}
      </button>
    </div>
  );
}
