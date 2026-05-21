import type { AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString } from "@/lib/i18n/types";
import {
  buildPostLocaleWritePayload,
  buildPostSeo,
  buildPostSlugs,
} from "@/lib/firestore/multilingual";
import { plainToSimpleHtml, stripHtmlToPlain, translateTextClient } from "@/lib/translation";

export { buildPostLocaleWritePayload, buildPostSeo, buildPostSlugs };

const TARGETS: AppLocale[] = ["vi", "en", "ko"];

/** Build { vi, en, ko } from author source text (browser → `/api/translate`). */
export async function buildLocalizedString(
  source: string,
  sourceLocale: AppLocale = "vi",
): Promise<LocalizedString> {
  const trimmed = source.trim();
  if (!trimmed) return { vi: "", en: "", ko: "" };

  const out: LocalizedString = { vi: "", en: "", ko: "" };
  out[sourceLocale] = trimmed;

  await Promise.all(
    TARGETS.filter((loc) => loc !== sourceLocale).map(async (loc) => {
      out[loc] = await translateTextClient(trimmed, loc, sourceLocale);
    }),
  );

  return out;
}

export async function buildLocalizedHtml(
  html: string,
  sourceLocale: AppLocale = "vi",
): Promise<LocalizedHtml> {
  const sourceHtml = html.trim();
  const plain = stripHtmlToPlain(sourceHtml);
  if (!plain) return { vi: "", en: "", ko: "" };

  const plainLocales = await buildLocalizedString(plain, sourceLocale);
  return {
    vi: sourceHtml,
    en: plainToSimpleHtml(plainLocales.en ?? ""),
    ko: plainToSimpleHtml(plainLocales.ko ?? ""),
  };
}
