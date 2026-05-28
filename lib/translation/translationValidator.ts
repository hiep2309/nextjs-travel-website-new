import type { AppLocale } from "@/i18n/routing";
import type { ExtendedTargetLocale } from "@/lib/glossary/glossary";
import { extractVisibleText } from "@/lib/html/htmlExtractor";
import { countPlaceholders } from "@/lib/html/placeholderManager";

/** Vietnamese diacritics — strong signal that translation to non-VI failed. */
const VIETNAMESE_CHAR_RE = /[ăâđêôơưĂÂĐÊÔƠƯàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/;

const PLACEHOLDER_RE = /\[\[TAG_\d+\]\]/;

export type TranslationFailureReason =
  | "empty"
  | "identical"
  | "vietnamese_leak"
  | "placeholder_missing"
  | "malformed";

export function containsVietnamese(text: string): boolean {
  return VIETNAMESE_CHAR_RE.test(text);
}

/** Detect failed or low-quality machine translation output. */
export function isTranslationFailed(
  source: string,
  translated: string,
  target: ExtendedTargetLocale,
  options?: { expectedPlaceholders?: number },
): { failed: boolean; reason?: TranslationFailureReason } {
  const src = source.trim();
  const out = translated.trim();

  if (!out) return { failed: true, reason: "empty" };
  if (src === out && target !== "vi") return { failed: true, reason: "identical" };

  const expected = options?.expectedPlaceholders ?? 0;
  if (expected > 0) {
    const count = countPlaceholders(out);
    if (count !== expected) {
      return { failed: true, reason: "placeholder_missing" };
    }
  }

  if (target !== "vi" && containsVietnamese(extractVisibleText(out))) {
    const srcPlain = extractVisibleText(src);
    const outPlain = extractVisibleText(out);
    if (srcPlain.length > 20 && (outPlain === srcPlain || outPlain.includes(srcPlain))) {
      return { failed: true, reason: "vietnamese_leak" };
    }
  }

  if (out.includes("[[TAG_") && countPlaceholders(out) === 0) {
    return { failed: true, reason: "malformed" };
  }

  return { failed: false };
}

export function normalizeSourceLocale(raw?: AppLocale): AppLocale {
  return raw ?? "vi";
}

/** True when output looks like untranslated source (for ko/en/ja targets). */
export function isLikelyUntranslated(
  source: string,
  translated: string,
  target: ExtendedTargetLocale,
): boolean {
  if (target === "vi") return false;

  const check = isTranslationFailed(source, translated, target);
  if (check.failed) return true;

  const src = extractVisibleText(source);
  const out = extractVisibleText(translated);
  if (!src || !out) return false;
  if (src === out) return true;

  // Large unchanged opening chunk → block was not localized
  if (src.length > 40) {
    const probe = src.slice(0, Math.min(100, src.length));
    if (out.includes(probe)) return true;
  }

  return blockHasVietnameseResidual(source, translated, target);
}

/**
 * Detect partial translation: translated block still embeds Vietnamese phrases from source.
 * Catches cases where the document-level probe passes but middle/end blocks stayed in VI.
 */
export function blockHasVietnameseResidual(
  sourceHtml: string,
  translatedHtml: string,
  target: ExtendedTargetLocale,
): boolean {
  if (target === "vi") return false;

  const src = extractVisibleText(sourceHtml);
  const out = extractVisibleText(translatedHtml);
  if (!src || !out || src.length < 12) return false;

  if (!containsVietnamese(out)) return false;

  const fragments = src
    .split(/(?<=[.!?。…])\s+|\n+/u)
    .map((s) => s.trim())
    .filter((s) => s.length >= 18 && containsVietnamese(s));

  for (const fragment of fragments) {
    if (out.includes(fragment)) return true;
  }

  if (containsVietnamese(src)) {
    const srcWords = src.split(/\s+/).filter((w) => w.length > 2 && containsVietnamese(w));
    if (srcWords.length >= 4) {
      const unchanged = srcWords.filter((w) => out.includes(w)).length;
      if (unchanged / srcWords.length >= 0.55) return true;
    }
  }

  return false;
}
