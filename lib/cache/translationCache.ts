import "server-only";
import { createHash } from "crypto";
import type { AppLocale } from "@/i18n/routing";
import type { ExtendedTargetLocale } from "@/lib/glossary/glossary";
import { getAdminFirestore, isAdminFirestoreAvailable } from "@/lib/server/firebaseAdmin";

const COLLECTION = "translations";

export type CachedTranslation = {
  original: string;
  translated: string;
  from: AppLocale;
  lang: ExtendedTargetLocale;
  updatedAt: number;
};

const memoryCache = new Map<string, CachedTranslation>();

function cacheDocId(original: string, from: AppLocale, to: ExtendedTargetLocale): string {
  return createHash("sha256").update(`${from}|${to}|${original}`).digest("hex");
}

function memoryGet(key: string): CachedTranslation | null {
  return memoryCache.get(key) ?? null;
}

function memorySet(key: string, value: CachedTranslation): void {
  memoryCache.set(key, value);
  if (memoryCache.size > 5000) {
    const first = memoryCache.keys().next().value;
    if (first) memoryCache.delete(first);
  }
}

/** Read cached translation (memory → Firestore). */
export async function getCachedTranslation(
  original: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<string | null> {
  const trimmed = original.trim();
  if (!trimmed || from === to) return trimmed;

  const id = cacheDocId(trimmed, from, to);
  const mem = memoryGet(id);
  if (mem?.translated) return mem.translated;

  const db = getAdminFirestore();
  if (!db) return null;

  try {
    const snap = await db.collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data() as Partial<CachedTranslation>;
    if (typeof data.translated !== "string" || !data.translated.trim()) return null;

    const entry: CachedTranslation = {
      original: trimmed,
      translated: data.translated.trim(),
      from,
      lang: to,
      updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),
    };
    memorySet(id, entry);
    return entry.translated;
  } catch (err) {
    console.warn("[translationCache] read failed:", err);
    return null;
  }
}

/** Persist translation to memory + Firestore (when admin SDK available). */
export async function setCachedTranslation(
  original: string,
  translated: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<void> {
  const trimmedOriginal = original.trim();
  const trimmedTranslated = translated.trim();
  if (!trimmedOriginal || !trimmedTranslated) return;
  if (trimmedOriginal === trimmedTranslated && from !== to) return;

  const id = cacheDocId(trimmedOriginal, from, to);
  const entry: CachedTranslation = {
    original: trimmedOriginal,
    translated: trimmedTranslated,
    from,
    lang: to,
    updatedAt: Date.now(),
  };
  memorySet(id, entry);

  const db = getAdminFirestore();
  if (!db) return;

  try {
    await db.collection(COLLECTION).doc(id).set(entry, { merge: true });
  } catch (err) {
    console.warn("[translationCache] write failed:", err);
  }
}

export function isTranslationCachePersistent(): boolean {
  return isAdminFirestoreAvailable();
}

/** Batch read — returns map of original → translated (cache hits only). */
export async function getCachedTranslationsBatch(
  originals: string[],
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  await Promise.all(
    originals.map(async (text) => {
      const hit = await getCachedTranslation(text, from, to);
      if (hit) out.set(text.trim(), hit);
    }),
  );
  return out;
}

/** Drop a bad cache entry so the next run re-translates with Gemini. */
export async function invalidateCachedTranslation(
  original: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<void> {
  const trimmed = original.trim();
  if (!trimmed) return;

  const id = cacheDocId(trimmed, from, to);
  memoryCache.delete(id);

  const db = getAdminFirestore();
  if (!db) return;

  try {
    await db.collection(COLLECTION).doc(id).delete();
  } catch (err) {
    console.warn("[translationCache] invalidate failed:", err);
  }
}
