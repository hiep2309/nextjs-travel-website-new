"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Landmark, Sparkles, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import { fadeUp } from "@/lib/planner/motionPresets";
import type { Dish } from "@/lib/food/types";

export default function CulturalStory({ dish }: { dish: Dish }) {
  const t = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();

  const items = [
    { icon: BookOpen, label: t("cultureHistory"), text: pickFoodText(dish.culture.history, locale) },
    {
      icon: Landmark,
      label: t("cultureSignificance"),
      text: pickFoodText(dish.culture.significance, locale),
    },
    { icon: Users, label: t("cultureTraditions"), text: pickFoodText(dish.culture.traditions, locale) },
  ];

  return (
    <motion.section
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
    >
      <header className="mb-5 flex items-center gap-2">
        <Sparkles className="size-4 text-violet-300" aria-hidden />
        <h3 className="text-lg font-bold text-white">{t("cultureTitle")}</h3>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ icon: Icon, label, text }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-violet-400/30 hover:bg-violet-600/5"
          >
            <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-blue-600/40 ring-1 ring-white/10">
              <Icon className="size-4 text-violet-200" aria-hidden />
            </span>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-violet-200/80">
              {label}
            </p>
            <p className="text-sm leading-relaxed text-white/75">{text}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
