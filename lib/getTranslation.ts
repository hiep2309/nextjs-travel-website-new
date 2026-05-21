/**
 * Resolve multilingual database fields for the active locale.
 *
 * Use for Firestore content (posts, destinations, guides) — NOT for UI strings.
 * UI copy lives in messages/{locale}.json via next-intl.
 */
import { defaultLocale, type AppLocale } from "@/i18n/routing";
import { pickLocalized, pickLocalizedHtml, pickSeo, pickSlug } from "@/lib/i18n/content";
import type {
  LocalizedSeo,
  LocalizedSlug,
  LocalizedString,
  LocalizedHtml,
} from "@/lib/i18n/types";

export type LocalizedField = LocalizedString | string | undefined | null;
export type LocalizedHtmlField = LocalizedHtml | string | undefined | null;

/** Resolve a plain localized string with Vietnamese fallback. */
export function getTranslation(
  field: LocalizedField,
  locale: AppLocale,
  fallbackLocale: AppLocale = defaultLocale,
): string {
  return pickLocalized(field, locale, fallbackLocale);
}

/** Resolve localized HTML content with Vietnamese fallback. */
export function getTranslationHtml(
  field: LocalizedHtmlField,
  locale: AppLocale,
  fallbackLocale: AppLocale = defaultLocale,
): string {
  return pickLocalizedHtml(field, locale, fallbackLocale);
}

export function getTranslationSlug(
  slugs: LocalizedSlug | undefined,
  locale: AppLocale,
  fallbackSlug?: string,
): string {
  return pickSlug(slugs, locale, fallbackSlug);
}

export function getTranslationSeo(seo: LocalizedSeo | undefined, locale: AppLocale) {
  return pickSeo(seo, locale);
}

export { pickLocalized, pickLocalizedHtml, pickSlug, pickSeo };
