"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Navigation, Star, Utensils } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import { fadeUp } from "@/lib/planner/motionPresets";
import type { Dish, Restaurant } from "@/lib/food/types";

const PRICE_SYMBOL: Record<Restaurant["priceRange"], string> = {
  budget: "$",
  mid: "$$",
  premium: "$$$",
};

export default function RecommendedPlaces({ dish }: { dish: Dish }) {
  const t = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
    >
      <header className="mb-5 flex items-center gap-2">
        <Utensils className="size-4 text-violet-300" aria-hidden />
        <h3 className="text-lg font-bold text-white">{t("placesTitle")}</h3>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {dish.restaurants.map((place) => (
          <motion.div
            key={place.name}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-violet-400/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate font-bold text-white">{place.name}</h4>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/55">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{pickFoodText(place.area, locale)}</span>
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-400/15 px-2 py-1 text-xs font-bold text-amber-200">
                <Star className="size-3 fill-amber-300 text-amber-300" aria-hidden />
                {place.rating.toFixed(1)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                <Navigation className="size-3" aria-hidden />
                {t("distanceLabel", { km: place.distanceKm })}
              </span>
              <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-semibold text-emerald-300">
                {PRICE_SYMBOL[place.priceRange]}
              </span>
              <span className="text-white/45">{t("reviewsLabel", { count: place.reviews })}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
