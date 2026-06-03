"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { currentSeason, getSeasonalDishes } from "@/lib/food/matchDishes";
import { fadeUp } from "@/lib/planner/motionPresets";
import type { Dish } from "@/lib/food/types";
import DishMiniCard from "./DishMiniCard";
import { SectionHeader } from "./TrendingDishes";

export default function SeasonalRecommendations({ onSelect }: { onSelect?: (dish: Dish) => void }) {
  const t = useTranslations("FoodExplorer");
  const reduceMotion = useReducedMotion();
  const season = currentSeason();
  const dishes = getSeasonalDishes(season).slice(0, 4);

  return (
    <motion.section
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <SectionHeader
        icon={Sun}
        title={t("seasonalTitle")}
        desc={t("seasonalDesc", { season: t(`season_${season}`) })}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {dishes.map((dish) => (
          <DishMiniCard key={dish.id} dish={dish} onSelect={onSelect} />
        ))}
      </div>
    </motion.section>
  );
}
