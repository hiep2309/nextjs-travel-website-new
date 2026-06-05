"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { dishToSavedFood, dishToTripFood } from "@/lib/food/dishSnapshot";
import { trackFoodEvent } from "@/lib/food/foodAnalytics";
import { addFoodToTrip, saveFoodToFavorites } from "@/lib/food/userFoodService";
import type { Dish } from "@/lib/food/types";
import { useAuth } from "@/hooks/useAuth";
import { useSavedFoods } from "@/hooks/useSavedFoods";
import { useTripFoods } from "@/hooks/useTripFoods";

export type FoodToastState = {
  message: string;
  isError?: boolean;
};

type Options = {
  onRequireAuth?: () => void;
};

export function useFoodActions(options: Options = {}) {
  const t = useTranslations("SavedFoods");
  const locale = useLocale() as AppLocale;
  const { user } = useAuth();
  const { isSaved, refresh: refreshSaved } = useSavedFoods(user?.uid);
  const { isInTrip, refresh: refreshTrip } = useTripFoods(user?.uid);
  const [toast, setToast] = useState<FoodToastState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const onRequireAuthRef = useRef(options.onRequireAuth);
  onRequireAuthRef.current = options.onRequireAuth;

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const requireAuth = useCallback(() => {
    showToast(t("authRequired"));
    onRequireAuthRef.current?.();
  }, [showToast, t]);

  const saveFood = useCallback(
    async (dish: Dish) => {
      if (!user) {
        requireAuth();
        return;
      }
      if (isSaved(dish.id)) {
        showToast(t("toastAlreadySaved"));
        return;
      }

      setBusyId(dish.id);
      try {
        const result = await saveFoodToFavorites(user.uid, dishToSavedFood(dish, locale));
        if (result === "duplicate") {
          showToast(t("toastAlreadySaved"));
        } else {
          showToast(t("toastSaved"));
          void trackFoodEvent(user.uid, "food_save", {
            foodId: dish.id,
            foodName: dishToSavedFood(dish, locale).name,
          });
          await refreshSaved();
        }
      } catch (err) {
        console.error("[saveFood]", err);
        showToast(t("toastError"), true);
      } finally {
        setBusyId(null);
      }
    },
    [user, isSaved, locale, refreshSaved, requireAuth, showToast, t],
  );

  const addToTrip = useCallback(
    async (dish: Dish) => {
      if (!user) {
        requireAuth();
        return;
      }
      if (isInTrip(dish.id)) {
        showToast(t("toastAlreadyInTrip"));
        return;
      }

      setBusyId(`${dish.id}-trip`);
      try {
        const result = await addFoodToTrip(user.uid, dishToTripFood(dish, locale));
        if (result === "duplicate") {
          showToast(t("toastAlreadyInTrip"));
        } else {
          showToast(t("toastAddedToTrip"));
          void trackFoodEvent(user.uid, "trip_add", {
            foodId: dish.id,
            foodName: dishToTripFood(dish, locale).name,
          });
          await refreshTrip();
        }
      } catch (err) {
        console.error("[addToTrip]", err);
        showToast(t("toastError"), true);
      } finally {
        setBusyId(null);
      }
    },
    [user, isInTrip, locale, refreshTrip, requireAuth, showToast, t],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  return {
    saveFood,
    addToTrip,
    isSaved,
    isInTrip,
    toast,
    dismissToast,
    busyId,
    isAuthenticated: Boolean(user),
  };
}
