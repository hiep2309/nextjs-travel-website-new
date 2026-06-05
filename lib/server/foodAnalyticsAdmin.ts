import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import type { FoodAnalyticsEvent } from "@/lib/food/userFoodTypes";
import { getAdminFirestore } from "@/lib/server/firebaseAdmin";

type TrackMeta = {
  foodId?: string;
  foodName?: string;
  destination?: string;
  locale?: string;
};

export async function trackFoodEventAdmin(
  userId: string,
  event: FoodAnalyticsEvent,
  meta: TrackMeta = {},
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) return;

  try {
    await db.collection(COLLECTIONS.foodAnalytics).add({
      userId,
      event,
      ...meta,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn("[foodAnalyticsAdmin]", event, err);
  }
}
