import type { AppLocale } from "@/i18n/routing";
import { getTranslationAuthHeaders } from "@/lib/translation/getAuthHeaders";

const clientCache = new Map<string, string>();

function cacheKey(text: string, from: string, to: string) {
  return `${from}|${to}|${text.length}|${text.slice(0, 120)}`;
}

/** Batch client translation via `/api/translate` POST with in-memory cache. */
export async function translateTextsClient(
  texts: string[],
  target: AppLocale,
  source: AppLocale = "vi",
): Promise<string[]> {
  if (target === source) return texts;

  const trimmed = texts.map((t) => t.trim());
  const missing = new Set<string>();

  for (const text of trimmed) {
    if (!text) continue;
    const key = cacheKey(text, source, target);
    if (!clientCache.has(key)) missing.add(text);
  }

  if (missing.size > 0) {
    try {
      const authHeaders = await getTranslationAuthHeaders();
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [...missing], from: source, to: target }),
      });
      if (res.ok) {
        const data = (await res.json()) as { texts?: string[] };
        const translated = data.texts ?? [...missing];
        [...missing].forEach((orig, i) => {
          const out = translated[i]?.trim() || orig;
          clientCache.set(cacheKey(orig, source, target), out);
        });
      }
    } catch {
      /* fall through — return originals for cache misses */
    }
  }

  return trimmed.map((text) => {
    if (!text || target === source) return text;
    return clientCache.get(cacheKey(text, source, target)) ?? text;
  });
}
