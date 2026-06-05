import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import type {
  SavedFoodRecord,
  TripFoodRecord,
  UserFoodCollections,
} from "@/lib/food/userFoodTypes";

function normalizeSavedFood(raw: unknown): SavedFoodRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.name !== "string") return null;
  return {
    id: r.id,
    name: r.name,
    city: String(r.city ?? ""),
    image: String(r.image ?? ""),
    category: r.category as SavedFoodRecord["category"],
    priceRange: r.priceRange as SavedFoodRecord["priceRange"],
    description: String(r.description ?? ""),
    savedAt: (r.savedAt as SavedFoodRecord["savedAt"]) ?? "",
  };
}

function normalizeTripFood(raw: unknown): TripFoodRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.name !== "string") return null;
  return {
    id: r.id,
    name: r.name,
    city: String(r.city ?? ""),
    image: String(r.image ?? ""),
    addedAt: (r.addedAt as TripFoodRecord["addedAt"]) ?? "",
  };
}

export function normalizeUserFoodCollections(data: unknown): UserFoodCollections {
  if (!data || typeof data !== "object") {
    return { savedFoods: [], tripFoods: [] };
  }
  const d = data as Record<string, unknown>;
  const savedFoods = Array.isArray(d.savedFoods)
    ? d.savedFoods.map(normalizeSavedFood).filter((x): x is SavedFoodRecord => x != null)
    : [];
  const tripFoods = Array.isArray(d.tripFoods)
    ? d.tripFoods.map(normalizeTripFood).filter((x): x is TripFoodRecord => x != null)
    : [];
  return { savedFoods, tripFoods };
}

export async function fetchUserFoodCollections(userId: string): Promise<UserFoodCollections> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, userId));
  if (!snap.exists()) return { savedFoods: [], tripFoods: [] };
  return normalizeUserFoodCollections(snap.data());
}

export function subscribeUserFoodCollections(
  userId: string,
  onData: (data: UserFoodCollections) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTIONS.users, userId),
    (snap) => {
      onData(normalizeUserFoodCollections(snap.data()));
    },
    (err) => onError?.(err),
  );
}

export type SaveFoodResult = "saved" | "duplicate";
export type TripFoodResult = "added" | "duplicate";

export async function saveFoodToFavorites(
  userId: string,
  item: Omit<SavedFoodRecord, "savedAt">,
): Promise<SaveFoodResult> {
  const ref = doc(db, COLLECTIONS.users, userId);
  const snap = await getDoc(ref);
  const { savedFoods } = normalizeUserFoodCollections(snap.data());
  if (savedFoods.some((f) => f.id === item.id)) return "duplicate";

  // serverTimestamp() is not supported inside arrays — use client Timestamp.now()
  const entry: SavedFoodRecord = { ...item, savedAt: Timestamp.now() };
  if (!snap.exists()) {
    await setDoc(ref, { uid: userId, savedFoods: [entry], tripFoods: [] }, { merge: true });
  } else {
    await updateDoc(ref, { savedFoods: [...savedFoods, entry] });
  }
  return "saved";
}

export async function addFoodToTrip(
  userId: string,
  item: Omit<TripFoodRecord, "addedAt">,
): Promise<TripFoodResult> {
  const ref = doc(db, COLLECTIONS.users, userId);
  const snap = await getDoc(ref);
  const { tripFoods } = normalizeUserFoodCollections(snap.data());
  if (tripFoods.some((f) => f.id === item.id)) return "duplicate";

  const entry: TripFoodRecord = { ...item, addedAt: Timestamp.now() };
  if (!snap.exists()) {
    await setDoc(ref, { uid: userId, savedFoods: [], tripFoods: [entry] }, { merge: true });
  } else {
    await updateDoc(ref, { tripFoods: [...tripFoods, entry] });
  }
  return "added";
}

export async function removeSavedFood(userId: string, foodId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.users, userId);
  const snap = await getDoc(ref);
  const { savedFoods, tripFoods } = normalizeUserFoodCollections(snap.data());
  await updateDoc(ref, { savedFoods: savedFoods.filter((f) => f.id !== foodId), tripFoods });
}

export async function removeTripFood(userId: string, foodId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.users, userId);
  const snap = await getDoc(ref);
  const { savedFoods, tripFoods } = normalizeUserFoodCollections(snap.data());
  await updateDoc(ref, { tripFoods: tripFoods.filter((f) => f.id !== foodId), savedFoods });
}

export async function moveSavedFoodToTrip(
  userId: string,
  saved: SavedFoodRecord,
): Promise<TripFoodResult> {
  const tripItem: Omit<TripFoodRecord, "addedAt"> = {
    id: saved.id,
    name: saved.name,
    city: saved.city,
    image: saved.image,
  };
  return addFoodToTrip(userId, tripItem);
}
