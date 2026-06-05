"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchUserFoodCollections,
  removeTripFood,
  subscribeUserFoodCollections,
} from "@/lib/food/userFoodService";
import type { TripFoodRecord } from "@/lib/food/userFoodTypes";

export function useTripFoods(userId: string | undefined) {
  const [items, setItems] = useState<TripFoodRecord[]>([]);
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
      ({ tripFoods }) => {
        setItems(tripFoods);
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
      setItems(data.tripFoods);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trip foods");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const remove = useCallback(
    async (foodId: string) => {
      if (!userId) return;
      await removeTripFood(userId, foodId);
      setItems((prev) => prev.filter((f) => f.id !== foodId));
    },
    [userId],
  );

  const isInTrip = useCallback(
    (foodId: string) => items.some((f) => f.id === foodId),
    [items],
  );

  const foodNames = items.map((f) => f.name);

  return { items, foodNames, loading, error, refresh, remove, isInTrip };
}
