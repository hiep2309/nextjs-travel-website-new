import type { AppLocale } from "@/i18n/routing";
import type { PlannerFormData, TripPlan } from "@/lib/planner/types";

type CacheEntry = {
  plan: TripPlan;
  cachedAt: number;
};

const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 48;

const store = new Map<string, CacheEntry>();

function normalizeDestination(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildPlanCacheKey(data: PlannerFormData, locale: AppLocale): string {
  return [
    locale,
    data.travelStyle,
    String(data.days),
    normalizeDestination(data.destination),
  ].join("|");
}

export function getCachedPlan(key: string): TripPlan | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.plan;
}

export function setCachedPlan(key: string, plan: TripPlan): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, { plan, cachedAt: Date.now() });
}

export function clearPlanCache(): void {
  store.clear();
}
