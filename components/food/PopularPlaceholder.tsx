"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Flame, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import { getPopularDishes } from "@/lib/food/matchDishes";
import { formatVnd } from "@/lib/food/options";
import { fadeUp } from "@/lib/planner/motionPresets";
import type { Dish } from "@/lib/food/types";

export default function PopularPlaceholder({ onSelect }: { onSelect: (dish: Dish) => void }) {
  const t = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();
  const dishes = getPopularDishes(5);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/40 to-rose-500/40 ring-1 ring-white/10">
              <Flame className="size-4 text-orange-200" aria-hidden />
            </span>
            {t("popularTitle")}
          </h3>
          <p className="mt-1.5 text-sm text-white/55">{t("popularHint")}</p>
        </div>
      </header>

      <ul className="space-y-2.5">
        {dishes.map((dish, i) => (
          <motion.li
            key={dish.id}
            variants={reduceMotion ? undefined : fadeUp}
            initial="hidden"
            animate="show"
            transition={reduceMotion ? undefined : { delay: i * 0.06 }}
          >
            <button
              type="button"
              onClick={() => onSelect(dish)}
              className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-2.5 text-left transition hover:border-violet-400/30 hover:bg-violet-600/5"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={dish.image}
                  alt={pickFoodText(dish.name, locale)}
                  fill
                  sizes="56px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-white">
                  {pickFoodText(dish.name, locale)}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-white/55">
                  <MapPin className="size-3 shrink-0 text-violet-300" aria-hidden />
                  <span className="truncate">{dish.destinations[0]}</span>
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs font-semibold text-violet-300">
                  {formatVnd(dish.priceVnd, locale)}
                </span>
                <ArrowRight
                  className="ml-auto mt-1 size-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-violet-300"
                  aria-hidden
                />
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      <p className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-center text-xs text-white/45">
        {t("emptyDesc")}
      </p>
    </div>
  );
}
