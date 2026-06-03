"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTrendingDishes } from "@/lib/food/matchDishes";
import { fadeUp } from "@/lib/planner/motionPresets";
import type { Dish } from "@/lib/food/types";
import DishMiniCard from "./DishMiniCard";

export default function TrendingDishes({ onSelect }: { onSelect?: (dish: Dish) => void }) {
  const t = useTranslations("FoodExplorer");
  const reduceMotion = useReducedMotion();
  const dishes = getTrendingDishes(4);

  return (
    <motion.section
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <SectionHeader icon={TrendingUp} title={t("trendingTitle")} desc={t("trendingDesc")} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {dishes.map((dish) => (
          <DishMiniCard key={dish.id} dish={dish} onSelect={onSelect} />
        ))}
      </div>
    </motion.section>
  );
}

export function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof TrendingUp;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-4 sm:mb-5">
      <h2 className="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
        <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-blue-600/40 ring-1 ring-white/10">
          <Icon className="size-4 text-violet-200" aria-hidden />
        </span>
        {title}
      </h2>
      <p className="mt-1.5 text-sm text-white/55">{desc}</p>
    </div>
  );
}
