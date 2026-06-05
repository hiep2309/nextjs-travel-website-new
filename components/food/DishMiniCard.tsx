"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import { dishCity, buildFoodMapsUrl } from "@/lib/food/dishSnapshot";
import { formatVnd } from "@/lib/food/options";
import type { Dish } from "@/lib/food/types";
import { useFoodActionsContext } from "./FoodActionsProvider";
import FoodCardActions from "./FoodCardActions";

type Props = {
  dish: Dish;
  onSelect?: (dish: Dish) => void;
};

export default function DishMiniCard({ dish, onSelect }: Props) {
  const t = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();
  const { saveFood, addToTrip, isSaved, isInTrip, busyId } = useFoodActionsContext();

  const saved = isSaved(dish.id);
  const inTrip = isInTrip(dish.id);
  const busy = busyId === dish.id || busyId === `${dish.id}-trip`;

  const openMaps = () => {
    const url = buildFoodMapsUrl(dish, locale);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  };

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="group relative z-0 flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] text-left shadow-xl backdrop-blur-xl transition hover:z-10 hover:border-violet-400/30"
    >
      <button
        type="button"
        onClick={() => onSelect?.(dish)}
        className="block w-full text-left"
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
          <p className="mt-0.5 line-clamp-1 text-xs text-white/55">{dishCity(dish, locale)}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-white/45">{pickFoodText(dish.tagline, locale)}</p>
          <p className="mt-2 text-xs font-semibold text-violet-300">
            {formatVnd(dish.priceVnd, locale)}
          </p>
        </div>
      </button>
      <div className="relative z-10 border-t border-white/10 bg-[#050816]/40 p-2.5">
        <FoodCardActions
          dish={dish}
          saved={saved}
          inTrip={inTrip}
          busy={busy}
          compact
          onSave={() => void saveFood(dish)}
          onAddToTrip={() => void addToTrip(dish)}
          onViewLocation={openMaps}
        />
      </div>
    </motion.div>
  );
}
