"use client";

import { useCallback, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { panelEnter } from "@/lib/planner/motionPresets";
import type { Dish } from "@/lib/food/types";
import { useFoodRecommendations } from "@/hooks/useFoodRecommendations";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PUBLIC_HEROES } from "@/lib/publicAssets";
import CulturalStory from "./CulturalStory";
import DishMiniCard from "./DishMiniCard";
import { FoodActionsProvider } from "./FoodActionsProvider";
import FoodExplorerForm from "./FoodExplorerForm";
import FoodLoading from "./FoodLoading";
import FoodMap from "./FoodMap";
import FoodRecommendationCard from "./FoodRecommendationCard";
import PopularPlaceholder from "./PopularPlaceholder";
import RecommendedPlaces from "./RecommendedPlaces";
import RegionalCollections from "./RegionalCollections";
import SeasonalRecommendations from "./SeasonalRecommendations";
import TrendingDishes from "./TrendingDishes";

function FoodExplorerContent() {
  const t = useTranslations("FoodExplorer");
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    form,
    setForm,
    loading,
    results,
    active,
    moreMatches,
    generate: runGenerate,
    selectDish,
  } = useFoodRecommendations();

  const generate = useCallback(() => {
    if (isMobile) {
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
    runGenerate({ instant: reduceMotion ?? false });
  }, [isMobile, reduceMotion, runGenerate]);

  const handleSelect = useCallback(
    (dish: Dish) => {
      selectDish(dish);
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [selectDish, reduceMotion],
  );

  return (
    <div className="relative pb-20 pt-20 text-white sm:pt-24">
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
                  <FoodRecommendationCard scored={active} />
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

        <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
          <TrendingDishes onSelect={handleSelect} />
          <RegionalCollections onSelect={handleSelect} />
          <SeasonalRecommendations onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}

export default function FoodExplorerClient() {
  return (
    <FoodActionsProvider>
      <FoodExplorerContent />
    </FoodActionsProvider>
  );
}
