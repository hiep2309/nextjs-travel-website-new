import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import { normalizeSavedItinerary } from "@/lib/itinerary/normalize";
import type { SavedItineraryRecord } from "@/lib/itinerary/types";

const PAGE_SIZE = 24;

export async function getItineraries(userId: string): Promise<SavedItineraryRecord[]> {
  const q = query(
    collection(db, COLLECTIONS.savedItineraries),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(PAGE_SIZE),
  );
  const snap = await getDocs(q);
  const rows: SavedItineraryRecord[] = [];
  snap.forEach((d) => {
    const row = normalizeSavedItinerary(d.id, d.data());
    if (row) rows.push(row);
  });
  return rows;
}

export async function getItineraryById(
  userId: string,
  id: string,
): Promise<SavedItineraryRecord | null> {
  const ref = doc(db, COLLECTIONS.savedItineraries, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const row = normalizeSavedItinerary(snap.id, snap.data());
  if (!row || row.userId !== userId) return null;
  return row;
}

export { PAGE_SIZE };
