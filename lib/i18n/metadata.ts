/**
 * SEO metadata helpers — hreflang, localized titles.
 */
import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { localeToHrefLang, locales } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/siteUrl";
import type { LocalizedSeo, LocalizedSlug } from "./types";
import { pickSeo, pickSlug } from "./content";

type PageMetaInput = {
  locale: AppLocale;
  path: string;
  slugs?: LocalizedSlug;
  seo?: LocalizedSeo;
  fallback?: { title: string; description: string; keywords?: string[] };
};

export function buildLocalizedMetadata({
  locale,
  path,
  slugs,
  seo,
  fallback,
}: PageMetaInput): Metadata {
  const site = getSiteUrl();
  const picked = pickSeo(seo, locale);
  const title = picked.title ?? fallback?.title ?? "VN Insight";
  const description = picked.description ?? fallback?.description ?? "";
  const keywords = picked.keywords ?? fallback?.keywords;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    const slug = slugs ? pickSlug(slugs, loc) : "";
    const segment = slug ? `${path}/${slug}` : path;
    languages[localeToHrefLang[loc]] = `${site}/${loc}${segment}`;
  }
  languages["x-default"] = `${site}/vi${path}`;

  const canonicalSlug = slugs ? pickSlug(slugs, locale) : "";
  const canonicalPath = canonicalSlug ? `${path}/${canonicalSlug}` : path;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${site}/${locale}${canonicalPath}`,
      languages,
    },
    openGraph: {
      title,
      description,
      locale: localeToHrefLang[locale].replace("-", "_"),
      type: "website",
      url: `${site}/${locale}${canonicalPath}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
