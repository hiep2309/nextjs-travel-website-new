"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchUserFoodCollections,
  removeSavedFood,
  subscribeUserFoodCollections,
} from "@/lib/food/userFoodService";
import type { SavedFoodRecord } from "@/lib/food/userFoodTypes";

export function useSavedFoods(userId: string | undefined) {
  const [items, setItems] = useState<SavedFoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeUserFoodCollections(
      userId,
      ({ savedFoods }) => {
        setItems(savedFoods);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchUserFoodCollections(userId);
      setItems(data.savedFoods);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved foods");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const remove = useCallback(
    async (foodId: string) => {
      if (!userId) return;
      await removeSavedFood(userId, foodId);
      setItems((prev) => prev.filter((f) => f.id !== foodId));
    },
    [userId],
  );

  const isSaved = useCallback(
    (foodId: string) => items.some((f) => f.id === foodId),
    [items],
  );

  return { items, loading, error, refresh, remove, isSaved };
}
