"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { panelEnter } from "@/lib/planner/motionPresets";
import { DEFAULT_PREFERENCES } from "@/lib/food/options";
import { getDishById } from "@/lib/food/dishes";
import { rankDishes } from "@/lib/food/matchDishes";
import type { Dish, FoodPreferences, ScoredDish } from "@/lib/food/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PUBLIC_HEROES } from "@/lib/publicAssets";
import CulturalStory from "./CulturalStory";
import DishMiniCard from "./DishMiniCard";
import FoodDiscoveryCard from "./FoodDiscoveryCard";
import FoodExplorerForm from "./FoodExplorerForm";
import FoodLoading from "./FoodLoading";
import FoodMap from "./FoodMap";
import PopularPlaceholder from "./PopularPlaceholder";
import RecommendedPlaces from "./RecommendedPlaces";
import RegionalCollections from "./RegionalCollections";
import SeasonalRecommendations from "./SeasonalRecommendations";
import TrendingDishes from "./TrendingDishes";

const SIMULATED_DELAY_MS = 2100;

export default function FoodExplorerClient() {
  const t = useTranslations("FoodExplorer");
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FoodPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoredDish[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo<ScoredDish | null>(() => {
    if (!results || results.length === 0) return null;
    return results.find((r) => r.dish.id === activeId) ?? results[0];
  }, [results, activeId]);

  const generate = useCallback(() => {
    setLoading(true);
    setResults(null);
    if (isMobile) {
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
    const ranked = rankDishes(form);
    window.setTimeout(
      () => {
        setResults(ranked);
        setActiveId(ranked[0]?.dish.id ?? null);
        setLoading(false);
      },
      reduceMotion ? 0 : SIMULATED_DELAY_MS,
    );
  }, [form, isMobile, reduceMotion]);

  const handleSelect = useCallback(
    (dish: Dish) => {
      // Ensure the dish appears in results so detail sections can render it.
      setActiveId(dish.id);
      if (!results) {
        setResults(rankDishes(form));
      }
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [form, results, reduceMotion],
  );

  // When selecting a dish not in the ranked list (edge case), inject it.
  useEffect(() => {
    if (!activeId || !results) return;
    if (results.some((r) => r.dish.id === activeId)) return;
    const dish = getDishById(activeId);
    if (dish) {
      setResults((prev) => (prev ? [{ dish, score: dish.popularity, reasons: [{ key: "reasonPopular" }] }, ...prev] : prev));
    }
  }, [activeId, results]);

  const moreMatches = useMemo(() => {
    if (!results || !active) return [];
    return results.filter((r) => r.dish.id !== active.dish.id).slice(0, 4);
  }, [results, active]);

  return (
    <div className="relative pb-20 pt-20 text-white sm:pt-24">
      {/* Background matches the AI Trip Planner: signup_pic.jpg dimmed + deep slate gradient. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('${PUBLIC_HEROES.appBackground}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-950/92 via-slate-950/88 to-slate-950/96"
        aria-hidden
      />

      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.header
          {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show" })}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-violet-200 backdrop-blur-xl">
            <Sparkles className="size-3.5" aria-hidden />
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 bg-gradient-to-br from-white via-white to-violet-200 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/60 sm:text-lg">
            {t("subtitle")}
          </p>
        </motion.header>

        {/* Form + Results */}
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr] lg:items-start lg:gap-8">
          <FoodExplorerForm
            value={form}
            onChange={setForm}
            onSubmit={generate}
            loading={loading}
          />

          <div ref={resultsRef} className="min-w-0 scroll-mt-24 lg:scroll-mt-28">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show", exit: "exit" })}
                >
                  <FoodLoading />
                </motion.div>
              ) : active ? (
                <motion.div
                  key="results"
                  {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show" })}
                  className="space-y-6"
                >
                  <FoodDiscoveryCard scored={active} />
                  <CulturalStory dish={active.dish} />
                  <RecommendedPlaces dish={active.dish} />
                  <FoodMap active={active.dish} dishes={results!.map((r) => r.dish)} />

                  {moreMatches.length > 0 ? (
                    <section>
                      <h3 className="mb-3 text-lg font-bold text-white">{t("moreMatches")}</h3>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {moreMatches.map(({ dish }) => (
                          <DishMiniCard key={dish.id} dish={dish} onSelect={handleSelect} />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show", exit: "exit" })}
                >
                  <PopularPlaceholder onSelect={handleSelect} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Extra sections */}
        <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
          <TrendingDishes onSelect={handleSelect} />
          <RegionalCollections onSelect={handleSelect} />
          <SeasonalRecommendations onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}
