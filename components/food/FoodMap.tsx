"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Landmark } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import { fadeUp } from "@/lib/planner/motionPresets";
import type { Dish } from "@/lib/food/types";

type Props = {
  /** Selected/top dish, highlighted on the map */
  active: Dish;
  /** Other dishes to plot as food locations */
  dishes: Dish[];
};

export default function FoodMap({ active, dishes }: Props) {
  const t = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();

  const points = dishes.slice(0, 6);

  return (
    <motion.section
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl"
    >
      <header className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <MapPin className="size-4 text-violet-300" aria-hidden />
        <h3 className="text-lg font-bold text-white">{t("mapTitle")}</h3>
      </header>

      <div
        className="relative min-h-[300px]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 28% 22%, rgba(139,92,246,0.20), transparent 45%), radial-gradient(circle at 70% 78%, rgba(59,130,246,0.18), transparent 45%), linear-gradient(160deg, #0a0f2c 0%, #050816 100%)",
        }}
      >
        {/* decorative coastline */}
        <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path
            d="M30 6 C 38 18, 34 28, 46 40 C 54 50, 50 60, 62 70 C 70 78, 66 88, 70 96"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
        </svg>

        {points.map((dish) => {
          const isActive = dish.id === active.id;
          return (
            <div
              key={dish.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${dish.map.x}%`, top: `${dish.map.y}%` }}
            >
              {isActive && !reduceMotion ? (
                <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-violet-500/30" />
              ) : null}
              <span
                className={`relative flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold shadow-lg backdrop-blur-sm ${
                  isActive
                    ? "border-violet-300/60 bg-gradient-to-r from-violet-500 to-blue-600 text-white"
                    : "border-white/15 bg-black/50 text-white/75"
                }`}
              >
                <MapPin className="size-3 shrink-0" aria-hidden />
                <span className="max-w-[88px] truncate">{pickFoodText(dish.name, locale)}</span>
              </span>
            </div>
          );
        })}

        <p className="absolute bottom-3 left-3 right-3 text-center text-[11px] text-white/40">
          {t("mapHint")}
        </p>
      </div>

      <div className="border-t border-white/10 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50">
          <Landmark className="size-3.5" aria-hidden />
          {t("attractionsTitle")}
        </p>
        <div className="flex flex-wrap gap-2">
          {active.nearbyAttractions.map((a, i) => (
            <span
              key={i}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
            >
              {pickFoodText(a, locale)}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
