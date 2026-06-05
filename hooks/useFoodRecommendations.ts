"use client";

import { useCallback, useMemo, useState } from "react";
import { getDishById } from "@/lib/food/dishes";
import { DEFAULT_PREFERENCES } from "@/lib/food/options";
import { rankDishes } from "@/lib/food/matchDishes";
import type { Dish, FoodPreferences, ScoredDish } from "@/lib/food/types";

const SIMULATED_DELAY_MS = 2100;

type GenerateOptions = {
  /** Skip simulated AI delay (e.g. reduced motion). */
  instant?: boolean;
};

/**
 * Client-side food recommendation state — mirrors AI Food Explorer ranking.
 */
export function useFoodRecommendations(initialPrefs: FoodPreferences = DEFAULT_PREFERENCES) {
  const [form, setForm] = useState<FoodPreferences>(initialPrefs);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoredDish[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo<ScoredDish | null>(() => {
    if (!results?.length) return null;
    return results.find((r) => r.dish.id === activeId) ?? results[0];
  }, [results, activeId]);

  const moreMatches = useMemo(() => {
    if (!results || !active) return [];
    return results.filter((r) => r.dish.id !== active.dish.id).slice(0, 4);
  }, [results, active]);

  const generate = useCallback(
    (options?: GenerateOptions) => {
      setLoading(true);
      setResults(null);
      const ranked = rankDishes(form);
      const finish = () => {
        setResults(ranked);
        setActiveId(ranked[0]?.dish.id ?? null);
        setLoading(false);
      };
      if (options?.instant) {
        finish();
      } else {
        window.setTimeout(finish, SIMULATED_DELAY_MS);
      }
    },
    [form],
  );

  const selectDish = useCallback(
    (dish: Dish) => {
      setActiveId(dish.id);
      if (!results) {
        setResults(rankDishes(form));
      } else if (!results.some((r) => r.dish.id === dish.id)) {
        setResults((prev) =>
          prev
            ? [{ dish, score: dish.popularity, reasons: [{ key: "reasonPopular" }] }, ...prev]
            : prev,
        );
      }
    },
    [form, results],
  );

  const ensureDishInResults = useCallback((dishId: string) => {
    if (!results?.some((r) => r.dish.id === dishId)) {
      const dish = getDishById(dishId);
      if (dish) {
        setResults((prev) =>
          prev
            ? [{ dish, score: dish.popularity, reasons: [{ key: "reasonPopular" }] }, ...prev]
            : [{ dish, score: dish.popularity, reasons: [{ key: "reasonPopular" }] }],
        );
      }
    }
  }, [results]);

  return {
    form,
    setForm,
    loading,
    results,
    active,
    activeId,
    setActiveId,
    moreMatches,
    generate,
    selectDish,
    ensureDishInResults,
  };
}
