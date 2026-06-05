import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import type { FoodAnalyticsEvent } from "@/lib/food/userFoodTypes";

type TrackMeta = {
  foodId?: string;
  foodName?: string;
  destination?: string;
  locale?: string;
};

export async function trackFoodEvent(
  userId: string,
  event: FoodAnalyticsEvent,
  meta: TrackMeta = {},
): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTIONS.foodAnalytics), {
      userId,
      event,
      ...meta,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("[foodAnalytics]", event, err);
  }
}
