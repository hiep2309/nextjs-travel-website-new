"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ChefHat,
  Clock,
  CloudSun,
  Fish,
  Leaf,
  Moon,
  Sandwich,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  UtensilsCrossed,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { fadeUp } from "@/lib/planner/motionPresets";
import {
  BUDGET_TIERS,
  DESTINATION_OPTIONS,
  FOOD_CATEGORIES,
  MEAL_TIME_OPTIONS,
} from "@/lib/food/options";
import type {
  BudgetTier,
  FoodCategory,
  FoodPreferences,
  MealTimePreference,
} from "@/lib/food/types";
import DestinationSelect from "@/components/ui/DestinationSelect";

const glass =
  "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl sm:rounded-3xl";
const touchBtn =
  "touch-manipulation min-h-[44px] active:scale-[0.98] transition-transform";

const categoryIcons: Record<FoodCategory, typeof Fish> = {
  seafood: Fish,
  street_food: Sandwich,
  local_specialties: UtensilsCrossed,
  vegetarian: Leaf,
  fine_dining: ChefHat,
};

const mealTimeIcons: Record<MealTimePreference, typeof Fish> = {
  any: Clock,
  breakfast: Sunrise,
  lunch: Sun,
  afternoon: CloudSun,
  dinner: Sunset,
  late_night: Moon,
};

type Props = {
  value: FoodPreferences;
  onChange: (next: FoodPreferences) => void;
  onSubmit: () => void;
  loading: boolean;
};

export default function FoodExplorerForm({ value, onChange, onSubmit, loading }: Props) {
  const t = useTranslations("FoodExplorer");
  const reduceMotion = useReducedMotion();

  const set = <K extends keyof FoodPreferences>(key: K, v: FoodPreferences[K]) => {
    onChange({ ...value, [key]: v });
  };

  const toggleCategory = (cat: FoodCategory) => {
    const has = value.categories.includes(cat);
    set(
      "categories",
      has ? value.categories.filter((c) => c !== cat) : [...value.categories, cat],
    );
  };

  return (
    <motion.aside
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      animate="show"
      className={`${glass} p-4 sm:p-6 lg:sticky lg:top-24 lg:p-7 xl:top-28`}
    >
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/30 sm:h-11 sm:w-11 sm:rounded-2xl">
          <UtensilsCrossed className="size-5 text-white" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/90 sm:tracking-[0.2em]">
            {t("eyebrow")}
          </p>
          <h2 className="truncate text-lg font-bold text-white sm:text-xl">{t("formTitle")}</h2>
        </div>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-white/60 sm:mb-6">{t("formHint")}</p>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
            {t("destination")}
          </span>
          <DestinationSelect
            value={value.destination}
            onChange={(d) => set("destination", d)}
            options={DESTINATION_OPTIONS}
            placeholder={t("selectDestination")}
            searchPlaceholder={t("searchDestination")}
            noResultText={t("noDestination")}
            clearLabel={t("clearDestination")}
          />
        </div>

        <ChipGroup label={t("budget")}>
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_TIERS.map((b) => (
              <Pill
                key={b}
                active={value.budget === b}
                onClick={() => set("budget", b as BudgetTier)}
                label={t(`budget_${b}`)}
                className="justify-center"
              />
            ))}
          </div>
        </ChipGroup>

        <ChipGroup label={t("mealTimeLabel")}>
          <div className="grid grid-cols-3 gap-2">
            {MEAL_TIME_OPTIONS.map((m) => {
              const Icon = mealTimeIcons[m];
              const active = value.mealTime === m;
              const label = m === "any" ? t("meal_any") : t(`meal_${m}`);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("mealTime", m as MealTimePreference)}
                  aria-pressed={active}
                  className={`${touchBtn} inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold ${
                    active
                      ? "border-violet-400/50 bg-violet-600/30 text-white shadow-md shadow-violet-900/20"
                      : "border-white/15 bg-black/25 text-white/70 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </ChipGroup>

        <ChipGroup label={t("preferences")}>
          <div className="grid grid-cols-2 gap-2">
            {FOOD_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat];
              const active = value.categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  aria-pressed={active}
                  className={`${touchBtn} inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                    active
                      ? "border-violet-400/50 bg-violet-600/30 text-white shadow-md shadow-violet-900/20"
                      : "border-white/15 bg-black/25 text-white/70 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{t(`cat_${cat}`)}</span>
                </button>
              );
            })}
          </div>
        </ChipGroup>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={reduceMotion || loading ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion || loading ? undefined : { scale: 0.98 }}
          className={`${touchBtn} flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-900/40 disabled:opacity-60 sm:rounded-2xl`}
        >
          <Sparkles className={`size-4 ${loading ? "animate-pulse" : ""}`} aria-hidden />
          {loading ? t("generating") : t("submit")}
        </motion.button>
      </form>
    </motion.aside>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  label,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${touchBtn} inline-flex items-center rounded-xl border px-3 py-2.5 text-xs font-semibold ${className} ${
        active
          ? "border-violet-400/50 bg-violet-600/35 text-white shadow-md shadow-violet-900/20"
          : "border-white/15 bg-black/25 text-white/70 hover:border-white/25 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
