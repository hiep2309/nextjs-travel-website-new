import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import { sanitizeForFirestore } from "@/lib/firestore/sanitize";
import { buildItineraryPayload } from "@/lib/itinerary/buildPayload";
import type { AppLocale } from "@/i18n/routing";
import type { PlannerFormData, TripPlan } from "@/lib/planner/types";

export async function saveItinerary(
  userId: string,
  plan: TripPlan,
  form: PlannerFormData,
  locale: AppLocale,
): Promise<string> {
  const payload = sanitizeForFirestore(buildItineraryPayload(userId, plan, form, locale));
  const ref = await addDoc(collection(db, COLLECTIONS.savedItineraries), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function touchItineraryUpdated(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.savedItineraries, id), {
    updatedAt: serverTimestamp(),
  });
}

export async function updateItineraryPlan(
  id: string,
  userId: string,
  plan: TripPlan,
  form: PlannerFormData,
  locale: AppLocale,
): Promise<void> {
  const payload = sanitizeForFirestore(buildItineraryPayload(userId, plan, form, locale));
  await updateDoc(doc(db, COLLECTIONS.savedItineraries, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}
