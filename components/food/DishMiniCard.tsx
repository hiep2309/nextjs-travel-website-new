"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import { formatVnd } from "@/lib/food/options";
import type { Dish } from "@/lib/food/types";

export default function DishMiniCard({
  dish,
  onSelect,
}: {
  dish: Dish;
  onSelect?: (dish: Dish) => void;
}) {
  const t = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(dish)}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="group block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] text-left shadow-xl backdrop-blur-xl transition hover:border-violet-400/30"
    >
      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src={dish.image}
          alt={pickFoodText(dish.name, locale)}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent" />
        {dish.trending ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-orange-500/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            <Flame className="size-3" aria-hidden />
            {t("trendingBadge")}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <h4 className="truncate text-sm font-bold text-white">{pickFoodText(dish.name, locale)}</h4>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/55">
          {pickFoodText(dish.tagline, locale)}
        </p>
        <p className="mt-2 text-xs font-semibold text-violet-300">
          {formatVnd(dish.priceVnd, locale)}
        </p>
      </div>
    </motion.button>
  );
}
