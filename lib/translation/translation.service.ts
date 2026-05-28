import "server-only";
import type { AppLocale } from "@/i18n/routing";
import {
  getCachedTranslation,
  invalidateCachedTranslation,
  setCachedTranslation,
} from "@/lib/cache/translationCache";
import type { ExtendedTargetLocale } from "@/lib/glossary/glossary";
import { splitHtmlIntoBlocks } from "@/lib/html/htmlExtractor";
import { validateTranslatedHtml } from "@/lib/html/htmlValidator";
import { protectHtmlTags, restoreHtmlTags } from "@/lib/html/placeholderManager";
import { callGeminiTranslate, isGeminiTranslationAvailable } from "@/lib/translation/providers/gemini";
import {
  isLikelyUntranslated,
} from "@/lib/translation/translationValidator";
import type {
  TranslateBatchOptions,
  TranslateHtmlOptions,
  TranslateTextOptions,
  TranslateTextResult,
} from "@/lib/translation/types";

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assertGeminiConfigured(): void {
  if (!isGeminiTranslationAvailable()) {
    throw new Error("GEMINI_API_KEY is not configured — translation requires Gemini");
  }
}

async function withRetry<T>(
  label: string,
  run: (attempt: number) => Promise<T>,
  validate: (result: T) => boolean,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await run(attempt);
      if (validate(result)) return result;
      console.warn(`[translation] ${label} failed validation (attempt ${attempt + 1}/${MAX_RETRIES})`);
    } catch (err) {
      lastError = err;
      console.warn(`[translation] ${label} error (attempt ${attempt + 1}/${MAX_RETRIES}):`, err);
    }

    if (attempt < MAX_RETRIES - 1) {
      await sleep(BASE_BACKOFF_MS * 2 ** attempt);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`${label} failed after ${MAX_RETRIES} retries`);
}

async function readValidCache(
  source: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<string | null> {
  const cached = await getCachedTranslation(source, from, to);
  if (!cached) return null;
  if (isLikelyUntranslated(source, cached, to)) {
    await invalidateCachedTranslation(source, from, to);
    return null;
  }
  return cached;
}

async function writeValidCache(
  source: string,
  translated: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<void> {
  if (isLikelyUntranslated(source, translated, to)) return;
  await setCachedTranslation(source, translated, from, to);
}

function splitListItems(inner: string): string[] {
  return inner.match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) ?? [];
}

async function translateInnerHtml(
  innerHtml: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<string> {
  const { text, tags } = protectHtmlTags(innerHtml);
  if (!text.replace(/\s+/g, "").replace(/\[\[TAG_\d+\]\]/g, "").trim()) {
    return innerHtml;
  }

  return withRetry(
    `inner:${from}->${to}`,
    async () => {
      const result = await callGeminiTranslate(text, from, to, "html-protected");
      return restoreHtmlTags(result, tags);
    },
    (out) => !isLikelyUntranslated(innerHtml, out, to),
  );
}

async function translateHtmlBlockInner(
  blockHtml: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
  options: { skipCache?: boolean } = {},
): Promise<string> {
  const trimmed = blockHtml.trim();
  if (!trimmed) return "";
  const skipCache = options.skipCache ?? false;

  if (!skipCache) {
    const cached = await readValidCache(trimmed, from, to);
    if (cached) return cached;
  }

  const listMatch = trimmed.match(/^<(ul|ol)\b([^>]*)>([\s\S]*)<\/\1>$/i);
  if (listMatch) {
    const [, tag, attrs, inner] = listMatch;
    const items = splitListItems(inner);
    if (items.length > 0) {
      const translatedItems: string[] = [];
      for (const item of items) {
        translatedItems.push(await translateHtmlBlockInner(item, from, to, options));
      }
      const joined = `<${tag}${attrs}>${translatedItems.join("")}</${tag}>`;
      await writeValidCache(trimmed, joined, from, to);
      return joined;
    }
  }

  try {
    const translated = await withRetry(
      `html-block:${from}->${to}`,
      async () => callGeminiTranslate(trimmed, from, to, "html-block"),
      (out) => {
        const validation = validateTranslatedHtml(trimmed, out);
        return validation.ok && !isLikelyUntranslated(trimmed, out, to);
      },
    );
    await writeValidCache(trimmed, translated, from, to);
    return translated;
  } catch (primaryErr) {
    console.warn("[translation] html-block failed, placeholder fallback:", primaryErr);
  }

  const elementMatch = trimmed.match(/^<(\w+)\b([^>]*)>([\s\S]*)<\/\1>$/i);
  if (!elementMatch) {
    throw new Error(`Unable to translate HTML block: ${trimmed.slice(0, 80)}`);
  }

  const [, tag, attrs, inner] = elementMatch;
  const innerTranslated = await translateInnerHtml(inner, from, to);
  const fallback = `<${tag}${attrs}>${innerTranslated}</${tag}>`;

  if (isLikelyUntranslated(trimmed, fallback, to)) {
    throw new Error(`Block still untranslated after fallback: ${trimmed.slice(0, 80)}`);
  }

  await writeValidCache(trimmed, fallback, from, to);
  return fallback;
}

/** Translate one HTML block with cache validation + forced retry when output is still Vietnamese. */
async function translateHtmlBlock(
  blockHtml: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<string> {
  let result = await translateHtmlBlockInner(blockHtml, from, to, { skipCache: false });

  if (isLikelyUntranslated(blockHtml, result, to)) {
    console.warn("[translation] block still untranslated — forcing fresh Gemini pass");
    await invalidateCachedTranslation(blockHtml, from, to);
    result = await translateHtmlBlockInner(blockHtml, from, to, { skipCache: true });
  }

  return result;
}

/** Translate plain text (no HTML) via Gemini + cache + retry. */
export async function translateText(options: TranslateTextOptions): Promise<TranslateTextResult> {
  assertGeminiConfigured();

  const { text, from, to, context = "travel-post" } = options;
  const trimmed = text.trim();
  if (!trimmed || from === to) {
    return { text: trimmed, provider: "gemini", cached: false };
  }

  const target = to as ExtendedTargetLocale;
  const cached = await readValidCache(trimmed, from, target);
  if (cached) {
    return { text: cached, provider: "gemini", cached: true };
  }

  const geminiContext = context === "travel-post-html" ? "html-protected" : "plain";

  const translated = await withRetry(
    `text:${from}->${to}`,
    async () =>
      callGeminiTranslate(
        trimmed,
        from,
        target,
        geminiContext === "html-protected" ? "html-protected" : "plain",
      ),
    (out) => !isLikelyUntranslated(trimmed, out, target),
  );

  await writeValidCache(trimmed, translated, from, target);
  return { text: translated, provider: "gemini", cached: false };
}

/** Translate HTML while preserving structure — sequential blocks, repair pass, validated cache. */
export async function translateHtmlContent(
  html: string,
  from: AppLocale,
  to: ExtendedTargetLocale,
  _options?: TranslateHtmlOptions,
): Promise<string> {
  assertGeminiConfigured();

  const source = html.trim();
  if (!source || from === to) return source;

  const fullCached = await readValidCache(source, from, to);
  if (fullCached && !documentHasUntranslatedBlocks(source, fullCached, to)) {
    return fullCached;
  }
  if (fullCached) {
    await invalidateCachedTranslation(source, from, to);
  }

  const blocks = splitHtmlIntoBlocks(source);
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.skipTranslation) {
      parts.push(block.html);
      continue;
    }
    parts.push(await translateHtmlBlock(block.html, from, to));
  }

  const repaired = await repairUntranslatedBlocks(blocks, parts, from, to);
  const joined = repaired.join("");

  if (!joined.trim()) {
    throw new Error("HTML translation produced empty output");
  }

  const validation = validateTranslatedHtml(source, joined);
  if (!validation.ok) {
    console.warn("[translation] HTML structure warnings:", validation.errors.join(", "));
  }

  if (documentHasUntranslatedBlocks(source, joined, to)) {
    throw new Error(
      `HTML body still contains untranslated Vietnamese after repair pass (${to})`,
    );
  }

  await writeValidCache(source, joined, from, to);
  return joined;
}

function documentHasUntranslatedBlocks(
  sourceHtml: string,
  translatedHtml: string,
  to: ExtendedTargetLocale,
): boolean {
  const srcBlocks = splitHtmlIntoBlocks(sourceHtml);
  const outBlocks = splitHtmlIntoBlocks(translatedHtml);
  if (srcBlocks.length !== outBlocks.length) return true;

  for (let i = 0; i < srcBlocks.length; i++) {
    const src = srcBlocks[i]!;
    const out = outBlocks[i]!;
    if (src.skipTranslation) continue;
    if (isLikelyUntranslated(src.html, out.html, to)) return true;
  }
  return false;
}

async function repairUntranslatedBlocks(
  sourceBlocks: ReturnType<typeof splitHtmlIntoBlocks>,
  translatedParts: string[],
  from: AppLocale,
  to: ExtendedTargetLocale,
): Promise<string[]> {
  const repaired = [...translatedParts];

  for (let i = 0; i < sourceBlocks.length; i++) {
    const src = sourceBlocks[i]!;
    if (src.skipTranslation) continue;

    const current = repaired[i] ?? "";
    if (!isLikelyUntranslated(src.html, current, to)) continue;

    console.warn(`[translation] repair pass — block ${i + 1}/${sourceBlocks.length}`);
    await invalidateCachedTranslation(src.html, from, to);
    repaired[i] = await translateHtmlBlockInner(src.html, from, to, { skipCache: true });
  }

  return repaired;
}

/** Translate many unique strings — cache-first, parallel with concurrency cap. */
export async function translateMany(
  texts: string[],
  from: AppLocale,
  to: ExtendedTargetLocale,
  options?: Omit<TranslateTextOptions, "text" | "from" | "to">,
): Promise<string[]> {
  if (from === to) return texts.map((t) => t.trim());

  const unique = [...new Set(texts.map((t) => t.trim()).filter(Boolean))];
  const map = new Map<string, string>();

  for (const text of unique) {
    const cached = await readValidCache(text, from, to);
    if (cached) map.set(text, cached);
  }

  const missing = unique.filter((t) => !map.has(t));
  for (const text of missing) {
    const result = await translateText({ ...options, text, from, to: to as AppLocale });
    map.set(text, result.text);
  }

  return texts.map((t) => {
    const trimmed = t.trim();
    if (!trimmed) return trimmed;
    return map.get(trimmed) ?? trimmed;
  });
}

export async function translateToEnglish(text: string, from: AppLocale = "vi"): Promise<string> {
  return (await translateText({ text, from, to: "en" })).text;
}

export async function translateToKorean(text: string, from: AppLocale = "vi"): Promise<string> {
  return (await translateText({ text, from, to: "ko" })).text;
}

export async function translateToJapanese(text: string, from: AppLocale = "vi"): Promise<string> {
  return translateHtmlBlockInner(`<p>${text}</p>`, from, "ja").then((html) =>
    html.replace(/^<p>/i, "").replace(/<\/p>$/i, ""),
  );
}

export async function translateBatch(
  texts: string[],
  from: AppLocale,
  to: ExtendedTargetLocale,
  options?: TranslateBatchOptions,
): Promise<string[]> {
  return translateMany(texts, from, to, options);
}

export { isGeminiTranslationAvailable };
