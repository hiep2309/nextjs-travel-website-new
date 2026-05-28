import type { AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString } from "@/lib/i18n/types";

const TARGETS: AppLocale[] = ["vi", "en", "ko"];

/**
 * @deprecated Client-side batch translation — use `/api/translate/post` pre-translation pipeline instead.
 * Post content should be translated on create/edit and stored in Firestore.
 */
export async function buildLocalizedString(
  source: string,
  sourceLocale: AppLocale = "vi",
): Promise<LocalizedString> {
  const trimmed = source.trim();
  if (!trimmed) return { vi: "", en: "", ko: "" };

  const out: LocalizedString = { vi: "", en: "", ko: "" };
  out[sourceLocale] = trimmed;

  const { translateTextClient } = await import("@/lib/translation/translateTextClient");
  await Promise.all(
    TARGETS.filter((loc) => loc !== sourceLocale).map(async (loc) => {
      out[loc] = await translateTextClient(trimmed, loc, sourceLocale);
    }),
  );

  return out;
}

/** @deprecated Use server `buildLocalizedHtmlServer` via `/api/translate/post`. */
export async function buildLocalizedHtml(
  html: string,
  sourceLocale: AppLocale = "vi",
): Promise<LocalizedHtml> {
  throw new Error(
    "buildLocalizedHtml is deprecated — save posts via requestPostTranslation() for pre-translated HTML.",
  );
}

export { buildPostLocaleWritePayload, buildPostSeo, buildPostSlugs } from "@/lib/firestore/multilingual";
