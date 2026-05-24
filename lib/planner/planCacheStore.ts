import "server-only";
import { createHash } from "crypto";
import type { AppLocale } from "@/i18n/routing";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import {
  FIRESTORE_CACHE_TTL_MS,
  MEMORY_CACHE_TTL_MS,
} from "@/lib/planner/plannerConfig";
import type { PlannerFormData, TripPlan } from "@/lib/planner/types";
import { getAdminFirestore, isAdminFirestoreAvailable } from "@/lib/server/firebaseAdmin";

type MemoryEntry = { plan: TripPlan; cachedAt: number };

const memoryStore = new Map<string, MemoryEntry>();
const MAX_MEMORY_ENTRIES = 64;

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Full cache key — identical requests share one cached plan. */
export function buildPlanCacheKey(
  data: PlannerFormData,
  locale: AppLocale,
  premiumMode = false,
): string {
  return [
    locale,
    data.travelStyle,
    String(data.days),
    normalize(data.destination),
    normalize(data.budget),
    data.transportation,
    data.pace,
    String(data.travelers),
    premiumMode ? "premium" : "standard",
  ].join("|");
}

export function hashCacheKey(cacheKey: string): string {
  return createHash("sha256").update(cacheKey).digest("hex").slice(0, 40);
}

function getMemoryCached(key: string): TripPlan | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > MEMORY_CACHE_TTL_MS) {
    memoryStore.delete(key);
    return null;
  }
  return entry.plan;
}

function setMemoryCached(key: string, plan: TripPlan): void {
  if (memoryStore.size >= MAX_MEMORY_ENTRIES) {
    const oldest = memoryStore.keys().next().value;
    if (oldest) memoryStore.delete(oldest);
  }
  memoryStore.set(key, { plan, cachedAt: Date.now() });
}

async function getFirestoreCached(docId: string): Promise<TripPlan | null> {
  const db = getAdminFirestore();
  if (!db || !isAdminFirestoreAvailable()) return null;

  try {
    const snap = await db.collection(COLLECTIONS.tripPlanCache).doc(docId).get();
    if (!snap.exists) return null;

    const data = snap.data() as {
      plan?: TripPlan;
      cachedAt?: { toMillis?: () => number };
      expiresAt?: { toMillis?: () => number };
    };

    const expiresAt = data.expiresAt?.toMillis?.() ?? 0;
    if (expiresAt && Date.now() > expiresAt) {
      void snap.ref.delete().catch(() => undefined);
      return null;
    }

    if (data.plan?.days?.length) return data.plan;
    return null;
  } catch (err) {
    console.warn("[planCacheStore] Firestore read failed:", err);
    return null;
  }
}

async function setFirestoreCached(
  docId: string,
  cacheKey: string,
  plan: TripPlan,
  model: string,
): Promise<void> {
  const db = getAdminFirestore();
  if (!db || !isAdminFirestoreAvailable()) return;

  try {
    const now = Date.now();
    await db
      .collection(COLLECTIONS.tripPlanCache)
      .doc(docId)
      .set({
        cacheKey,
        plan,
        model,
        cachedAt: new Date(now),
        expiresAt: new Date(now + FIRESTORE_CACHE_TTL_MS),
      });
  } catch (err) {
    console.warn("[planCacheStore] Firestore write failed:", err);
  }
}

export async function getCachedTripPlan(cacheKey: string): Promise<{
  plan: TripPlan;
  source: "memory" | "firestore";
  cachedAt: number;
} | null> {
  const memory = getMemoryCached(cacheKey);
  if (memory) {
    return { plan: memory, source: "memory", cachedAt: Date.now() };
  }

  const docId = hashCacheKey(cacheKey);
  const firestore = await getFirestoreCached(docId);
  if (firestore) {
    setMemoryCached(cacheKey, firestore);
    return { plan: firestore, source: "firestore", cachedAt: Date.now() };
  }

  return null;
}

export async function setCachedTripPlan(
  cacheKey: string,
  plan: TripPlan,
  model: string,
): Promise<void> {
  setMemoryCached(cacheKey, plan);
  const docId = hashCacheKey(cacheKey);
  await setFirestoreCached(docId, cacheKey, plan, model);
}

export function clearMemoryPlanCache(): void {
  memoryStore.clear();
}
