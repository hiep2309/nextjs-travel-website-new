"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import AuthPromptModal from "@/components/itinerary/AuthPromptModal";
import { useFoodActions, type FoodToastState } from "@/hooks/useFoodActions";
import type { Dish } from "@/lib/food/types";
import FoodToast from "./FoodToast";

type FoodActionsContextValue = {
  saveFood: (dish: Dish) => Promise<void>;
  addToTrip: (dish: Dish) => Promise<void>;
  isSaved: (id: string) => boolean;
  isInTrip: (id: string) => boolean;
  busyId: string | null;
  toast: FoodToastState | null;
  dismissToast: () => void;
};

const FoodActionsContext = createContext<FoodActionsContextValue | null>(null);

export function FoodActionsProvider({ children }: { children: ReactNode }) {
  const [showAuth, setShowAuth] = useState(false);
  const actions = useFoodActions({
    onRequireAuth: () => setShowAuth(true),
  });

  const value = useMemo(
    () => ({
      saveFood: actions.saveFood,
      addToTrip: actions.addToTrip,
      isSaved: actions.isSaved,
      isInTrip: actions.isInTrip,
      busyId: actions.busyId,
      toast: actions.toast,
      dismissToast: actions.dismissToast,
    }),
    [
      actions.saveFood,
      actions.addToTrip,
      actions.isSaved,
      actions.isInTrip,
      actions.busyId,
      actions.toast,
      actions.dismissToast,
    ],
  );

  return (
    <FoodActionsContext.Provider value={value}>
      {children}
      <FoodToast toast={actions.toast} onDismiss={actions.dismissToast} />
      <AuthPromptModal open={showAuth} onClose={() => setShowAuth(false)} />
    </FoodActionsContext.Provider>
  );
}

export function useFoodActionsContext(): FoodActionsContextValue {
  const ctx = useContext(FoodActionsContext);
  if (!ctx) {
    throw new Error("useFoodActionsContext must be used within FoodActionsProvider");
  }
  return ctx;
}
