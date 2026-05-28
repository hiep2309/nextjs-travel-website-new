import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";
import type {
  LocalizedHtml,
  LocalizedString,
  PostLocaleTranslation,
  PostTranslations,
} from "@/lib/i18n/types";
import type { TravelPost } from "@/lib/travelPost";

/** Optional future locale stored in Firestore (not in next-intl routing yet). */
export type ExtendedPostLocale = AppLocale | "ja";

export type PostTranslationResolution = {
  locale: AppLocale;
  title: string;
  description: string;
  contentHtml: string;
  titleFrom: ExtendedPostLocale;
  contentFrom: ExtendedPostLocale;
  descriptionFrom: ExtendedPostLocale;
  usedContentFallback: boolean;
  availableLocales: ExtendedPostLocale[];
  debug: {
    currentLocale: AppLocale;
    availableTranslations: ExtendedPostLocale[];
    renderedTitleLocale: ExtendedPostLocale;
    renderedContentLocale: ExtendedPostLocale;
    hasKoreanContent: boolean;
    hasEnglishContent: boolean;
  };
};

const ALL_LOCALES: ExtendedPostLocale[] = [...locales, "ja"];

function pickTranslationField(
  translations: PostTranslations,
  locale: ExtendedPostLocale,
  field: keyof PostLocaleTranslation,
  options?: { strictLocale?: boolean },
): { value: string; from: ExtendedPostLocale | null } {
  const direct = translations[locale]?.[field]?.trim();
  if (direct) return { value: direct, from: locale };

  if (options?.strictLocale) {
    return { value: "", from: null };
  }

  for (const loc of locales) {
    if (loc === locale) continue;
    const hit = translations[loc]?.[field]?.trim();
    if (hit) return { value: hit, from: loc };
  }

  const ja = translations.ja?.[field]?.trim();
  if (ja) return { value: ja, from: "ja" };

  return { value: "", from: null };
}

/** Build canonical `translations` map from legacy Firestore fields. */
export function buildPostTranslationsFromLegacy(
  title: LocalizedString,
  description: LocalizedString,
  contentHtml: LocalizedHtml,
): PostTranslations {
  const out: PostTranslations = {};

  for (const loc of ALL_LOCALES) {
    const key = loc as AppLocale;
    const t = loc === "ja" ? undefined : title[key]?.trim();
    const d = loc === "ja" ? undefined : description[key]?.trim();
    const c = loc === "ja" ? undefined : contentHtml[key]?.trim();
    if (t || d || c) {
      out[loc] = {
        title: t ?? "",
        description: d ?? "",
        content: c ?? "",
      };
    }
  }

  return out;
}

/** Normalize raw Firestore `translations` or synthesize from legacy fields. */
export function normalizePostTranslations(
  raw: unknown,
  title: LocalizedString,
  description: LocalizedString,
  contentHtml: LocalizedHtml,
): PostTranslations {
  const legacy = buildPostTranslationsFromLegacy(title, description, contentHtml);

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return legacy;
  }

  const map = raw as Record<string, unknown>;
  const parsed: PostTranslations = {};

  for (const [key, value] of Object.entries(map)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    if (key !== "vi" && key !== "en" && key !== "ko" && key !== "ja") continue;

    const entry = value as Record<string, unknown>;
    const loc = key as ExtendedPostLocale;
    const entryTitle = typeof entry.title === "string" ? entry.title.trim() : "";
    const entryDesc =
      typeof entry.description === "string"
        ? entry.description.trim()
        : typeof entry.excerpt === "string"
          ? entry.excerpt.trim()
          : "";
    const entryContent =
      typeof entry.content === "string"
        ? entry.content.trim()
        : typeof entry.contentHtml === "string"
          ? entry.contentHtml.trim()
          : "";

    if (entryTitle || entryDesc || entryContent) {
      parsed[loc] = {
        title: entryTitle,
        description: entryDesc,
        content: entryContent,
      };
    }
  }

  return mergeTranslations(parsed, legacy);
}

/** Prefer explicit `translations` entries; fill gaps from legacy maps. */
export function mergeTranslations(
  primary: PostTranslations,
  legacy: PostTranslations,
): PostTranslations {
  const keys = new Set<ExtendedPostLocale>([
    ...ALL_LOCALES,
    ...(Object.keys(primary) as ExtendedPostLocale[]),
    ...(Object.keys(legacy) as ExtendedPostLocale[]),
  ]);

  const out: PostTranslations = {};
  for (const loc of keys) {
    const p = primary[loc];
    const l = legacy[loc];
    if (!p && !l) continue;
    out[loc] = {
      title: p?.title?.trim() || l?.title?.trim() || "",
      description: p?.description?.trim() || l?.description?.trim() || "",
      content: p?.content?.trim() || l?.content?.trim() || "",
    };
  }
  return out;
}

/** Write shape — sync legacy localized fields + nested translations. */
export function buildPostTranslationsWritePayload(
  title: LocalizedString,
  description: LocalizedString,
  contentHtml: LocalizedHtml,
): PostTranslations {
  return buildPostTranslationsFromLegacy(title, description, contentHtml);
}

/**
 * Resolve post copy for the active UI locale.
 * Map: vi → Vietnamese, en → English, ko → Korean, ja → Japanese (when stored).
 */
export function resolvePostTranslation(post: TravelPost, locale: AppLocale): PostTranslationResolution {
  const translations =
    post.translations ??
    buildPostTranslationsFromLegacy(post.title, post.description, post.contentHtml);

  const availableLocales = ALL_LOCALES.filter((loc) => {
    const entry = translations[loc];
    return Boolean(entry?.title?.trim() || entry?.content?.trim() || entry?.description?.trim());
  });

  const titlePick = pickTranslationField(translations, locale, "title");
  const descPick = pickTranslationField(translations, locale, "description", { strictLocale: true });
  const contentPick = pickTranslationField(translations, locale, "content", { strictLocale: true });

  const titleFrom = (titlePick.from ?? defaultLocale) as ExtendedPostLocale;
  const descriptionFrom = (descPick.from ?? locale) as ExtendedPostLocale;
  const contentFrom = (contentPick.from ?? locale) as ExtendedPostLocale;

  return {
    locale,
    title: titlePick.value,
    description: descPick.value,
    contentHtml: contentPick.value,
    titleFrom,
    contentFrom,
    descriptionFrom,
    usedContentFallback: false,
    availableLocales,
    debug: {
      currentLocale: locale,
      availableTranslations: availableLocales,
      renderedTitleLocale: titleFrom,
      renderedContentLocale: contentFrom,
      hasKoreanContent: Boolean(translations.ko?.content?.trim()),
      hasEnglishContent: Boolean(translations.en?.content?.trim()),
    },
  };
}

/** Dev-only structured logging for translation resolution. */
export function logPostTranslationDebug(postId: string, resolution: PostTranslationResolution): void {
  if (process.env.NODE_ENV !== "development") return;
  console.debug("[PostTranslation]", {
    postId,
    currentLocale: resolution.debug.currentLocale,
    availableTranslations: resolution.debug.availableTranslations,
    renderedTitleLocale: resolution.debug.renderedTitleLocale,
    renderedContentLocale: resolution.debug.renderedContentLocale,
    usedContentFallback: resolution.usedContentFallback,
    hasKoreanContent: resolution.debug.hasKoreanContent,
    hasEnglishContent: resolution.debug.hasEnglishContent,
    titlePreview: resolution.title.slice(0, 80),
    contentPreview: resolution.contentHtml.replace(/<[^>]+>/g, " ").slice(0, 120),
  });
}

export function listStoredContentLocales(post: TravelPost): ExtendedPostLocale[] {
  const translations =
    post.translations ??
    buildPostTranslationsFromLegacy(post.title, post.description, post.contentHtml);
  return ALL_LOCALES.filter((loc) => Boolean(translations[loc]?.content?.trim()));
}

export function assertLocaleContentExists(post: TravelPost, locale: AppLocale): boolean {
  return listStoredContentLocales(post).includes(locale);
}

/** Map next-intl locale → translation bucket. */
export function localeToTranslationKey(locale: string): ExtendedPostLocale {
  if (locale === "ko" || locale === "en" || locale === "vi" || locale === "ja") {
    return locale;
  }
  if ((locales as readonly string[]).includes(locale)) return locale as AppLocale;
  return defaultLocale;
}
