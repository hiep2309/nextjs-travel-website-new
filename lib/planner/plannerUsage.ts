import "server-only";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import { FREE_DAILY_GENERATE_LIMIT } from "@/lib/planner/plannerConfig";
import { getAdminFirestore, isAdminFirestoreAvailable } from "@/lib/server/firebaseAdmin";

type UsageSnapshot = {
  count: number;
  limit: number;
  remaining: number;
  dateKey: string;
};

const memoryUsage = new Map<string, number>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function usageDocId(uid: string): string {
  return `${uid}_${todayKey()}`;
}

function memoryGet(uid: string): number {
  return memoryUsage.get(usageDocId(uid)) ?? 0;
}

function memoryTryIncrement(uid: string): { ok: boolean; count: number } {
  const key = usageDocId(uid);
  const current = memoryUsage.get(key) ?? 0;
  if (current >= FREE_DAILY_GENERATE_LIMIT) {
    return { ok: false, count: current };
  }
  const next = current + 1;
  memoryUsage.set(key, next);
  return { ok: true, count: next };
}

export async function getPlannerUsage(uid: string): Promise<UsageSnapshot> {
  const dateKey = todayKey();
  let count = 0;

  const db = getAdminFirestore();
  if (db && isAdminFirestoreAvailable()) {
    try {
      const snap = await db.collection(COLLECTIONS.plannerDailyUsage).doc(usageDocId(uid)).get();
      count = typeof snap.data()?.count === "number" ? snap.data()!.count : 0;
    } catch {
      count = memoryGet(uid);
    }
  } else {
    count = memoryGet(uid);
  }

  const remaining = Math.max(0, FREE_DAILY_GENERATE_LIMIT - count);
  return { count, limit: FREE_DAILY_GENERATE_LIMIT, remaining, dateKey };
}

export async function consumePlannerGeneration(uid: string): Promise<UsageSnapshot> {
  const db = getAdminFirestore();
  const docId = usageDocId(uid);

  if (db && isAdminFirestoreAvailable()) {
    try {
      const ref = db.collection(COLLECTIONS.plannerDailyUsage).doc(docId);
      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const current = typeof snap.data()?.count === "number" ? snap.data()!.count : 0;
        if (current >= FREE_DAILY_GENERATE_LIMIT) {
          return { blocked: true as const, count: current };
        }
        const next = current + 1;
        tx.set(
          ref,
          { uid, dateKey: todayKey(), count: next, updatedAt: new Date() },
          { merge: true },
        );
        return { blocked: false as const, count: next };
      });

      if (result.blocked) {
        const remaining = 0;
        return {
          count: result.count,
          limit: FREE_DAILY_GENERATE_LIMIT,
          remaining,
          dateKey: todayKey(),
        };
      }

      return {
        count: result.count,
        limit: FREE_DAILY_GENERATE_LIMIT,
        remaining: Math.max(0, FREE_DAILY_GENERATE_LIMIT - result.count),
        dateKey: todayKey(),
      };
    } catch (err) {
      console.warn("[plannerUsage] Firestore transaction failed, using memory:", err);
    }
  }

  const result = memoryTryIncrement(uid);
  return {
    count: result.count,
    limit: FREE_DAILY_GENERATE_LIMIT,
    remaining: Math.max(0, FREE_DAILY_GENERATE_LIMIT - result.count),
    dateKey: todayKey(),
  };
}

export async function checkPlannerQuota(uid: string): Promise<{
  allowed: boolean;
  usage: UsageSnapshot;
}> {
  const usage = await getPlannerUsage(uid);
  return { allowed: usage.remaining > 0, usage };
}
