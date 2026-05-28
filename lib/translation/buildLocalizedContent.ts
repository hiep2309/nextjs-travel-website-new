import { locales, type AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString } from "@/lib/i18n/types";
import type { ExtendedTargetLocale } from "@/lib/glossary/glossary";
import {
  isGeminiTranslationAvailable,
  translateHtmlContent,
  translateText,
} from "@/lib/translation/translation.service";
import type { TranslatePostInput, TranslatePostResult } from "@/lib/translation/types";
import {
  buildArticleTranslationsWritePayload,
  deriveLocalizedMapsFromTranslations,
} from "@/lib/posts/articleTranslations";

type BuildOptions = {
  sourceLocale?: AppLocale;
};

/** Build { vi, en, ko } from author source text. Server-side only — Gemini + cache. */
export async function buildLocalizedStringServer(
  source: string,
  options: BuildOptions = {},
): Promise<LocalizedString> {
  const sourceLocale = options.sourceLocale ?? "vi";
  const trimmed = source.trim();
  if (!trimmed) return { vi: "", en: "", ko: "" };

  const out: LocalizedString = { vi: "", en: "", ko: "" };
  out[sourceLocale] = trimmed;

  for (const loc of locales.filter((l) => l !== sourceLocale)) {
    const result = await translateText({
      text: trimmed,
      from: sourceLocale,
      to: loc,
      context: "travel-post",
    });
    out[loc] = result.text;
  }

  return out;
}

/** Pre-translate HTML body into all locales — sequential to avoid rate limits + partial failure. */
export async function buildLocalizedHtmlServer(
  html: string,
  options: BuildOptions = {},
): Promise<LocalizedHtml> {
  const sourceLocale = options.sourceLocale ?? "vi";
  const sourceHtml = html.trim();
  if (!sourceHtml) return { vi: "", en: "", ko: "" };

  const out: LocalizedHtml = { [sourceLocale]: sourceHtml };
  const targets = locales.filter((loc) => loc !== sourceLocale);

  for (const loc of targets) {
    console.info(`[translation] HTML body → ${loc} (${sourceHtml.length} chars)`);
    out[loc] = await translateHtmlContent(
      sourceHtml,
      sourceLocale,
      loc as ExtendedTargetLocale,
    );
  }

  return out;
}

/** Translate post title and HTML body into all locales (pre-translation pipeline). */
export async function translatePostFields(
  input: TranslatePostInput,
  options: BuildOptions = {},
): Promise<TranslatePostResult> {
  if (!isGeminiTranslationAvailable()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const sourceLocale = options.sourceLocale ?? input.sourceLocale ?? "vi";

  const title = await buildLocalizedStringServer(input.title, { sourceLocale });
  const contentHtml = await buildLocalizedHtmlServer(input.contentHtml, { sourceLocale });

  const { description } = deriveLocalizedMapsFromTranslations(
    buildArticleTranslationsWritePayload(title, contentHtml),
  );

  return { title, description, contentHtml };
}
