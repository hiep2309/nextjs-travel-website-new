import { locales, type AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString } from "@/lib/i18n/types";
import { plainToSimpleHtml, stripHtmlToPlain } from "@/lib/translation/htmlUtils";
import { translateText } from "@/lib/translation/translateText";
import type { TranslatePostInput, TranslatePostResult, TranslationProvider } from "@/lib/translation/types";

type BuildOptions = {
  sourceLocale?: AppLocale;
  provider?: TranslationProvider;
};

/** Build { vi, en, ko } from author source text. Server-side only. */
export async function buildLocalizedStringServer(
  source: string,
  options: BuildOptions = {},
): Promise<LocalizedString> {
  const sourceLocale = options.sourceLocale ?? "vi";
  const trimmed = source.trim();
  if (!trimmed) return { vi: "", en: "", ko: "" };

  const out: LocalizedString = { vi: "", en: "", ko: "" };
  out[sourceLocale] = trimmed;

  await Promise.all(
    locales
      .filter((loc) => loc !== sourceLocale)
      .map(async (loc) => {
        const result = await translateText({
          text: trimmed,
          from: sourceLocale,
          to: loc,
          provider: options.provider,
          context: "travel-post",
        });
        out[loc] = result.text;
      }),
  );

  return out;
}

/** Build localized HTML — keeps source HTML; translates plain text for other locales. */
export async function buildLocalizedHtmlServer(
  html: string,
  options: BuildOptions = {},
): Promise<LocalizedHtml> {
  const sourceLocale = options.sourceLocale ?? "vi";
  const sourceHtml = html.trim();
  const plain = stripHtmlToPlain(sourceHtml);
  if (!plain) return { vi: "", en: "", ko: "" };

  const plainLocales = await buildLocalizedStringServer(plain, options);
  const out: LocalizedHtml = { [sourceLocale]: sourceHtml };

  for (const loc of locales) {
    if (loc === sourceLocale) continue;
    out[loc] = plainToSimpleHtml(plainLocales[loc] ?? "");
  }

  return out;
}

/** Translate post title, description, and HTML body into all locales. */
export async function translatePostFields(
  input: TranslatePostInput,
  options: BuildOptions = {},
): Promise<TranslatePostResult> {
  const sourceLocale = options.sourceLocale ?? "vi";
  const [title, description, contentHtml] = await Promise.all([
    buildLocalizedStringServer(input.title, options),
    buildLocalizedStringServer(input.description, options),
    buildLocalizedHtmlServer(input.contentHtml, { ...options, sourceLocale }),
  ]);

  return { title, description, contentHtml };
}
