/**
 * Post translation resolution — re-exports canonical article API + legacy aliases.
 */
import type { AppLocale } from "@/i18n/routing";
import type {
  LocalizedHtml,
  LocalizedString,
  PostTranslations,
} from "@/lib/i18n/types";
import type { TravelPost } from "@/lib/travelPost";
import {
  buildArticleTranslationsWritePayload,
  buildTranslationsFromLegacyMaps,
  normalizeArticleTranslations,
  resolveArticleTranslation,
  listArticleContentLocales,
} from "@/lib/posts/articleTranslations";

export type { ArticleTranslation, ResolvedArticle } from "@/lib/posts/articleTranslations";
export {
  buildArticleTranslationsWritePayload,
  buildTranslationsFromLegacyMaps,
  deriveLocalizedMapsFromTranslations,
  normalizeArticleTranslations,
  resolveArticleTranslation,
  listArticleContentLocales,
} from "@/lib/posts/articleTranslations";

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
};

/** @deprecated Use buildTranslationsFromLegacyMaps */
export const buildPostTranslationsFromLegacy = buildTranslationsFromLegacyMaps;

/** @deprecated Use normalizeArticleTranslations */
export const normalizePostTranslations = normalizeArticleTranslations;

/** @deprecated Use buildArticleTranslationsWritePayload */
export const buildPostTranslationsWritePayload = buildArticleTranslationsWritePayload;

export function resolvePostTranslation(post: TravelPost, locale: AppLocale): PostTranslationResolution {
  const resolved = resolveArticleTranslation(post, locale);
  const translations =
    post.translations ??
    buildTranslationsFromLegacyMaps(post.title, post.contentHtml, post.description);

  const availableLocales = (["vi", "en", "ko"] as AppLocale[]).filter((loc) => {
    const entry = translations[loc];
    return Boolean(entry?.title?.trim() || entry?.content?.trim());
  });

  return {
    locale: resolved.locale,
    title: resolved.title,
    description: resolved.description,
    contentHtml: resolved.content,
    titleFrom: resolved.locale,
    contentFrom: resolved.locale,
    descriptionFrom: resolved.locale,
    usedContentFallback: resolved.usedFallback,
    availableLocales,
  };
}

export function logPostTranslationDebug(_postId: string, _resolution: PostTranslationResolution): void {
  /* dev logging removed — articles resolve from Firestore only */
}

export function assertLocaleContentExists(post: TravelPost, locale: AppLocale): boolean {
  return listArticleContentLocales(post).includes(locale);
}

export function localeToTranslationKey(locale: string): AppLocale {
  if (locale === "ko" || locale === "en" || locale === "vi") return locale;
  return "vi";
}

export function mergeTranslations(
  primary: PostTranslations,
  legacy: PostTranslations,
): PostTranslations {
  const out: PostTranslations = {};
  for (const loc of ["vi", "en", "ko"] as AppLocale[]) {
    const p = primary[loc];
    const l = legacy[loc];
    if (!p && !l) continue;
    out[loc] = {
      title: p?.title?.trim() || l?.title?.trim() || "",
      content: p?.content?.trim() || l?.content?.trim() || "",
    };
  }
  return out;
}
