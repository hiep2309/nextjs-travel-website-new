"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { localizeTripPlan } from "@/lib/planner/localizeTripPlan";
import type { TripPlan } from "@/lib/planner/types";

export function useLocalizedTripPlan(plan: TripPlan | null, sourceLocale: AppLocale) {
  const locale = useLocale() as AppLocale;
  const [displayPlan, setDisplayPlan] = useState<TripPlan | null>(plan);
  const [localizing, setLocalizing] = useState(false);

  useEffect(() => {
    if (!plan) {
      setDisplayPlan(null);
      setLocalizing(false);
      return;
    }

    if (sourceLocale === locale) {
      setDisplayPlan(plan);
      setLocalizing(false);
      return;
    }

    let cancelled = false;
    setLocalizing(true);
    setDisplayPlan(plan);

    void localizeTripPlan(plan, sourceLocale, locale)
      .then((localized) => {
        if (!cancelled) {
          setDisplayPlan(localized);
          setLocalizing(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDisplayPlan(plan);
          setLocalizing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [plan, sourceLocale, locale]);

  return { plan: displayPlan, localizing };
}
