"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Flame, Landmark, Mountain, Star, Waves } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { fadeUp } from "@/lib/planner/motionPresets";
import {
  POPULAR_TEMPLATES,
  type PlannerTemplate,
  type PlannerTemplateIcon,
} from "@/lib/planner/templates";

const ICONS: Record<PlannerTemplateIcon, typeof Waves> = {
  beach: Waves,
  culture: Landmark,
  mountain: Mountain,
  city: Building2,
};

export default function PlannerTemplates({
  onApply,
}: {
  onApply: (template: PlannerTemplate) => void;
}) {
  const t = useTranslations("AiPlanner");
  const locale = useLocale() as AppLocale;
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-6">
      <header className="mb-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/40 to-rose-500/40 ring-1 ring-white/10">
            <Flame className="size-4 text-orange-200" aria-hidden />
          </span>
          {t("templatesTitle")}
        </h3>
        <p className="mt-1.5 text-sm text-white/55">{t("templatesHint")}</p>
      </header>

      <ul className="space-y-2.5">
        {POPULAR_TEMPLATES.map((tpl, i) => {
          const Icon = ICONS[tpl.icon];
          return (
            <motion.li
              key={tpl.id}
              variants={reduceMotion ? undefined : fadeUp}
              initial="hidden"
              animate="show"
              transition={reduceMotion ? undefined : { delay: i * 0.06 }}
            >
              <button
                type="button"
                onClick={() => onApply(tpl)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-violet-400/30 hover:bg-violet-600/5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-blue-600/40 ring-1 ring-white/10">
                  <Icon className="size-5 text-violet-200" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-white">
                    {tpl.destination[locale] ?? tpl.destination.vi}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-white/55">
                    <span>{t("templateDays", { count: tpl.days })}</span>
                    <span className="inline-flex items-center gap-0.5 text-amber-200">
                      <Star className="size-3 fill-amber-300 text-amber-300" aria-hidden />
                      {tpl.rating.toFixed(1)}
                    </span>
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-violet-300"
                  aria-hidden
                />
              </button>
            </motion.li>
          );
        })}
      </ul>

      <p className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-center text-xs text-white/45">
        {t("emptyDesc")}
      </p>
    </div>
  );
}
