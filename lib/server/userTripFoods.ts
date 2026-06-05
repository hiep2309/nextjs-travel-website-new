import "server-only";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import { normalizeUserFoodCollections } from "@/lib/food/userFoodService";
import { getAdminFirestore } from "@/lib/server/firebaseAdmin";

/** Dish names the user queued for AI Trip Planner (server-side prompt injection). */
export async function getUserTripFoodNames(uid: string): Promise<string[]> {
  const db = getAdminFirestore();
  if (!db) return [];

  try {
    const snap = await db.collection(COLLECTIONS.users).doc(uid).get();
    if (!snap.exists) return [];
    const { tripFoods } = normalizeUserFoodCollections(snap.data());
    return tripFoods.map((f) => f.name).filter(Boolean);
  } catch (err) {
    console.warn("[userTripFoods]", err);
    return [];
  }
}
