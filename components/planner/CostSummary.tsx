"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatVnd, parseVndCost } from "@/lib/planner/parseCost";
import type { TripPlan } from "@/lib/planner/types";

type Props = {
  plan: TripPlan;
  budgetRaw: string;
};

export default function CostSummary({ plan, budgetRaw }: Props) {
  const t = useTranslations("AiPlanner");

  const { total, budget, percent, breakdown } = useMemo(() => {
    const byCat: Record<string, number> = {};
    for (const day of plan.days) {
      for (const act of day.activities) {
        const cat = act.category?.trim() || t("other");
        byCat[cat] = (byCat[cat] ?? 0) + parseVndCost(act.estimated_cost);
      }
    }
    const sumActs = Object.values(byCat).reduce((a, b) => a + b, 0);
    const total = parseVndCost(plan.total_estimated_cost) || sumActs;
    const budget = parseVndCost(budgetRaw) || total;
    const percent = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : 0;
    const breakdown = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    return { total, budget, percent, breakdown };
  }, [plan, budgetRaw, t]);

  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:rounded-2xl sm:p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-violet-300/90">
        {t("budgetTitle")}
      </h3>
      <div className="mt-3 flex flex-col items-center gap-4 sm:mt-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative shrink-0 scale-90 sm:scale-100">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <motion.circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="url(#budgetGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="budgetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white">{percent}%</span>
            <span className="text-[10px] text-white/50">{t("ofBudget")}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold text-white">{plan.total_estimated_cost}</p>
          <p className="mt-1 text-sm text-white/50">
            {t("budgetLimit")}: {budgetRaw || formatVnd(budget)}
          </p>
          <ul className="mt-4 space-y-2">
            {breakdown.map(([cat, amt]) => (
              <li key={cat} className="flex justify-between gap-2 text-sm">
                <span className="truncate text-white/70">{cat}</span>
                <span className="shrink-0 font-medium text-white">{formatVnd(amt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
