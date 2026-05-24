import type { AppLocale } from "@/i18n/routing";
import { getTranslationAuthHeaders } from "@/lib/translation/getAuthHeaders";

const clientCache = new Map<string, string>();

function cacheKey(text: string, from: string, to: string) {
  return `${from}|${to}|${text.length}|${text.slice(0, 120)}`;
}

async function fetchChunk(text: string, from: AppLocale, to: AppLocale): Promise<string> {
  try {
    const authHeaders = await getTranslationAuthHeaders();
    const params = new URLSearchParams({ q: text, from, to });
    const res = await fetch(`/api/translate?${params}`, { headers: authHeaders });
    if (!res.ok) return text;
    const data = (await res.json()) as { text?: string; provider?: string };
    return data.text?.trim() || text;
  } catch {
    return text;
  }
}

/**
 * Client-side translation via `/api/translate` with in-memory cache.
 * Used when creating posts from the browser.
 */
export async function translateTextClient(
  text: string,
  target: AppLocale,
  source: AppLocale = "vi",
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || target === source) return trimmed;

  const key = cacheKey(trimmed, source, target);
  const hit = clientCache.get(key);
  if (hit) return hit;

  const chunkSize = 480;
  if (trimmed.length <= chunkSize) {
    const out = await fetchChunk(trimmed, source, target);
    clientCache.set(key, out);
    return out;
  }

  const parts: string[] = [];
  for (let i = 0; i < trimmed.length; i += chunkSize) {
    parts.push(trimmed.slice(i, i + chunkSize));
  }
  const translated = (await Promise.all(parts.map((p) => fetchChunk(p, source, target)))).join("");
  clientCache.set(key, translated);
  return translated;
}
