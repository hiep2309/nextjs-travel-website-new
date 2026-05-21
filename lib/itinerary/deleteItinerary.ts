import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";

export async function deleteItinerary(userId: string, id: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.savedItineraries, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  if (snap.data().userId !== userId) {
    throw new Error("Not authorized to delete this itinerary");
  }
  await deleteDoc(ref);
}
