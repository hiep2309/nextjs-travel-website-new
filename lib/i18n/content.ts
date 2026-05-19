/**
 * Resolve localized fields from Firestore documents with safe fallbacks.
 */
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";
import type { LocalizedSeo, LocalizedSlug, LocalizedString } from "./types";

export function pickLocalized(
  field: LocalizedString | string | undefined | null,
  locale: AppLocale,
  fallbackLocale: AppLocale = defaultLocale,
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return (
    field[locale]?.trim() ||
    field[fallbackLocale]?.trim() ||
    field.vi?.trim() ||
    Object.values(field).find((v) => v?.trim())?.trim() ||
    ""
  );
}

export function pickLocalizedHtml(
  field: Partial<Record<AppLocale, string>> | string | undefined | null,
  locale: AppLocale,
  fallbackLocale: AppLocale = defaultLocale,
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return (
    field[locale]?.trim() ||
    field[fallbackLocale]?.trim() ||
    field.vi?.trim() ||
    Object.values(field).find((v) => v?.trim())?.trim() ||
    ""
  );
}

export function pickSlug(
  slugs: LocalizedSlug | undefined,
  locale: AppLocale,
  fallbackSlug?: string,
): string {
  if (!slugs) return fallbackSlug ?? "";
  return slugs[locale]?.trim() || slugs[defaultLocale]?.trim() || fallbackSlug || "";
}

export function pickSeo(
  seo: LocalizedSeo | undefined,
  locale: AppLocale,
): { title?: string; description?: string; keywords?: string[] } {
  if (!seo) return {};
  return seo[locale] ?? seo[defaultLocale] ?? {};
}

/** Build alternate locale paths for hreflang link tags */
export function buildAlternateUrls(
  basePath: string,
  slugsByLocale: LocalizedSlug,
  siteUrl: string,
): { locale: AppLocale; href: string }[] {
  return locales.map((locale) => {
    const slug = slugsByLocale[locale];
    const path = slug ? `${basePath}/${slug}` : basePath;
    return {
      locale,
      href: `${siteUrl}/${locale}${path}`,
    };
  });
}
