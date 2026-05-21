"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteItinerary } from "@/lib/itinerary/deleteItinerary";
import { getItineraries } from "@/lib/itinerary/getItineraries";
import type { SavedItineraryRecord } from "@/lib/itinerary/types";

export function useSavedItineraries(userId: string | undefined) {
  const [items, setItems] = useState<SavedItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await getItineraries(userId);
      setItems(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load itineraries");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return;
      await deleteItinerary(userId, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [userId],
  );

  return { items, loading, error, refresh, remove };
}
