"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, MapPin, Sparkles, Star, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import { dishCity, buildFoodMapsUrl } from "@/lib/food/dishSnapshot";
import { formatVnd } from "@/lib/food/options";
import { panelEnter } from "@/lib/planner/motionPresets";
import type { ScoredDish } from "@/lib/food/types";
import { useFoodActionsContext } from "./FoodActionsProvider";
import FoodCardActions from "./FoodCardActions";

function reasonText(
  reason: ScoredDish["reasons"][number],
  t: ReturnType<typeof useTranslations<"FoodExplorer">>,
): string {
  switch (reason.key) {
    case "reasonDestination":
      return t("reasonDestination", { value: reason.value ?? "" });
    case "reasonCategory":
      return t("reasonCategory", { value: t(`cat_${reason.value}`) });
    case "reasonBudget":
      return t("reasonBudget", { value: t(`budget_${reason.value}`) });
    case "reasonMeal":
      return t("reasonMeal", { value: t(`meal_${reason.value}`) });
    case "reasonTrending":
      return t("reasonTrending");
    case "reasonRegional":
      return t("reasonRegional", { value: reason.value ?? "" });
    default:
      return t("reasonPopular");
  }
}

type Props = {
  scored: ScoredDish;
  showMatchScore?: boolean;
};

export default function FoodRecommendationCard({
  scored,
  showMatchScore = true,
}: Props) {
  const { saveFood, addToTrip, isSaved, isInTrip, busyId } = useFoodActionsContext();
  const t = useTranslations("FoodExplorer");
  const tFood = useTranslations("SavedFoods");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();
  const { dish, score, reasons } = scored;
  const city = dishCity(dish, locale);
  const saved = isSaved(dish.id);
  const inTrip = isInTrip(dish.id);
  const busy = busyId === dish.id || busyId === `${dish.id}-trip`;

  const openMaps = () => {
    const url = buildFoodMapsUrl(dish, locale);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  };

  return (
    <motion.article
      {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show" })}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-xl"
    >
      <div className="relative h-64 w-full overflow-hidden sm:h-80">
        <Image
          src={dish.image}
          alt={pickFoodText(dish.name, locale)}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {showMatchScore ? (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2 backdrop-blur-md">
            <Sparkles className="size-4 text-violet-300" aria-hidden />
            <div className="text-right leading-none">
              <p className="text-[9px] font-bold uppercase tracking-wider text-violet-200/80">
                {t("matchScore")}
              </p>
              <p className="text-lg font-black text-white">{score}%</p>
            </div>
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-600/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-100">
            <Star className="size-3" aria-hidden />
            {t("topPick")}
          </span>
          <h3 className="text-2xl font-black text-white sm:text-3xl">
            {pickFoodText(dish.name, locale)}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-violet-300" aria-hidden />
              {city}
            </span>
            <span className="text-white/40">·</span>
            <span>{t(`cat_${dish.category}`)}</span>
            <span className="text-white/40">·</span>
            <span>{tFood("priceRangeLabel", { tier: t(`budget_${dish.budgetTier}`) })}</span>
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-white/60">
            {pickFoodText(dish.tagline, locale)}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-white/75">
          {pickFoodText(dish.description, locale)}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <InfoTile icon={Wallet} label={t("price")}>
            {formatVnd(dish.priceVnd, locale)}
          </InfoTile>
          <InfoTile icon={Clock} label={t("bestTime")}>
            {dish.bestTime.map((m) => t(`meal_${m}`)).join(" · ")}
          </InfoTile>
        </div>

        {reasons.length > 0 ? (
          <div className="rounded-2xl border border-violet-400/20 bg-violet-600/10 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-200">
              <Sparkles className="size-3.5" aria-hidden />
              {t("whyTitle")}
            </p>
            <ul className="space-y-1.5">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-blue-400" />
                  {reasonText(reason, t)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <FoodCardActions
          dish={dish}
          saved={saved}
          inTrip={inTrip}
          busy={busy}
          onSave={() => void saveFood(dish)}
          onAddToTrip={() => void addToTrip(dish)}
          onViewLocation={openMaps}
        />
      </div>
    </motion.article>
  );
}

function InfoTile({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Wallet;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/45">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </p>
      <p className="text-sm font-semibold text-white">{children}</p>
    </div>
  );
}
