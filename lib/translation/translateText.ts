import type { AppLocale } from "@/i18n/routing";
import { isGeminiTranslationAvailable, translateWithGemini } from "@/lib/translation/providers/gemini";
import { translateWithMyMemory } from "@/lib/translation/providers/mymemory";
import type { TranslateTextOptions, TranslateTextResult, TranslationProvider } from "@/lib/translation/types";

const SERVER_CACHE = new Map<string, string>();

const CHUNK_SIZE = 450;

function cacheKey(text: string, from: AppLocale, to: AppLocale, provider: TranslationProvider): string {
  return `${provider}|${from}|${to}|${text.length}|${text.slice(0, 80)}`;
}

async function translateChunk(
  text: string,
  from: AppLocale,
  to: AppLocale,
  provider: TranslationProvider,
  context: TranslateTextOptions["context"],
): Promise<{ text: string; provider: TranslateTextResult["provider"] }> {
  const useGemini =
    provider === "gemini" || (provider === "auto" && isGeminiTranslationAvailable());

  if (useGemini) {
    try {
      const out = await translateWithGemini(text, from, to, context ?? "travel-post");
      return { text: out, provider: "gemini" };
    } catch {
      if (provider === "gemini") throw new Error("Gemini translation failed");
    }
  }

  const out = await translateWithMyMemory(text, from, to);
  return { text: out, provider: "mymemory" };
}

/**
 * Server-side translation helper — Gemini when configured, MyMemory fallback.
 * Use from API routes, scripts, and server actions — not from client components.
 */
export async function translateText(options: TranslateTextOptions): Promise<TranslateTextResult> {
  const {
    text,
    from,
    to,
    provider = "auto",
    context = "travel-post",
  } = options;

  const trimmed = text.trim();
  if (!trimmed || from === to) {
    return { text: trimmed, provider: "none", cached: false };
  }

  const key = cacheKey(trimmed, from, to, provider);
  const cached = SERVER_CACHE.get(key);
  if (cached) {
    return { text: cached, provider: "mymemory", cached: true };
  }

  if (trimmed.length <= CHUNK_SIZE) {
    const result = await translateChunk(trimmed, from, to, provider, context);
    SERVER_CACHE.set(key, result.text);
    return { ...result, cached: false };
  }

  const parts: string[] = [];
  for (let i = 0; i < trimmed.length; i += CHUNK_SIZE) {
    parts.push(trimmed.slice(i, i + CHUNK_SIZE));
  }

  let usedProvider: TranslateTextResult["provider"] = "mymemory";
  const translated = await Promise.all(
    parts.map(async (part) => {
      const result = await translateChunk(part, from, to, provider, context);
      usedProvider = result.provider;
      return result.text;
    }),
  );

  const out = translated.join("");
  SERVER_CACHE.set(key, out);
  return { text: out, provider: usedProvider, cached: false };
}

/** Translate many strings in parallel (deduped). */
export async function translateMany(
  texts: string[],
  from: AppLocale,
  to: AppLocale,
  options?: Omit<TranslateTextOptions, "text" | "from" | "to">,
): Promise<string[]> {
  const unique = [...new Set(texts.map((t) => t.trim()).filter(Boolean))];
  const map = new Map<string, string>();

  await Promise.all(
    unique.map(async (text) => {
      const result = await translateText({ ...options, text, from, to });
      map.set(text, result.text);
    }),
  );

  return texts.map((t) => {
    const trimmed = t.trim();
    if (!trimmed || from === to) return trimmed;
    return map.get(trimmed) ?? trimmed;
  });
}
