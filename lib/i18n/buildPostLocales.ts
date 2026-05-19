import type { AppLocale } from "@/i18n/routing";
import type { LocalizedString } from "@/lib/i18n/types";
import { plainToSimpleHtml, stripHtmlToPlain, translateTextClient } from "@/lib/i18n/machineTranslate";

const TARGETS: AppLocale[] = ["vi", "en", "ko"];

/** Build { vi, en, ko } from author source text (machine translation for en/ko). */
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
): Promise<LocalizedString> {
  const viHtml = html.trim();
  const plain = stripHtmlToPlain(viHtml);
  if (!plain) return { vi: "", en: "", ko: "" };

  const plainLocales = await buildLocalizedString(plain, sourceLocale);
  return {
    vi: viHtml,
    en: plainToSimpleHtml(plainLocales.en ?? ""),
    ko: plainToSimpleHtml(plainLocales.ko ?? ""),
  };
}
