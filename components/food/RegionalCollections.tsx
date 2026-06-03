"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Map } from "lucide-react";
import { useTranslations } from "next-intl";
import { getDishesByRegion } from "@/lib/food/matchDishes";
import { fadeUp } from "@/lib/planner/motionPresets";
import type { Dish, FoodRegion } from "@/lib/food/types";
import DishMiniCard from "./DishMiniCard";
import { SectionHeader } from "./TrendingDishes";

const REGIONS: FoodRegion[] = ["north", "central", "south"];

export default function RegionalCollections({ onSelect }: { onSelect?: (dish: Dish) => void }) {
  const t = useTranslations("FoodExplorer");
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      <SectionHeader icon={Map} title={t("regionalTitle")} desc={t("regionalDesc")} />
      <div className="space-y-6">
        {REGIONS.map((region) => {
          const dishes = getDishesByRegion(region);
          if (dishes.length === 0) return null;
          return (
            <div key={region}>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full border border-violet-400/30 bg-violet-600/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-100">
                  {t(`region_${region}`)}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {dishes.map((dish) => (
                  <DishMiniCard key={dish.id} dish={dish} onSelect={onSelect} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
