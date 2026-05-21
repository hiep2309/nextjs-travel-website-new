/**
 * Firestore multilingual schema — canonical types for all localized documents.
 *
 * UI strings → messages/*.json (next-intl)
 * DB content  → fields shaped as LocalizedString / LocalizedHtml
 */
import type { AppLocale } from "@/i18n/routing";
import type { PostType } from "@/lib/postCategories";

export type LocalizedString = Partial<Record<AppLocale, string>> & {
  vi?: string;
};

/** HTML body per locale */
export type LocalizedHtml = Partial<Record<AppLocale, string>>;

export type LocalizedSlug = Partial<Record<AppLocale, string>>;

export type LocalizedSeoEntry = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type LocalizedSeo = Partial<Record<AppLocale, LocalizedSeoEntry>>;

export type TranslationStatus = "draft" | "machine" | "reviewed" | "published";

export type TranslationStatusMap = Partial<Record<AppLocale, TranslationStatus>>;

/** Shared metadata on every multilingual Firestore document */
export type LocalizedDocumentBase = {
  sourceLocale?: AppLocale;
  slugs?: LocalizedSlug;
  seo?: LocalizedSeo;
  translationStatus?: TranslationStatusMap;
  updatedAt?: { seconds?: number } | unknown;
};

/** @deprecated Legacy duplicate of title.vi — read-only fallback */
export type LegacyPostFields = {
  name?: string;
  slug?: string;
};

export type MultilingualPost = LocalizedDocumentBase &
  LegacyPostFields & {
    id: string;
    title: LocalizedString;
    description: LocalizedString;
    contentHtml: LocalizedHtml;
    image?: string;
    images?: string[];
    thumb?: string;
    region?: string;
    regionKey?: string;
    country?: string;
    postType?: PostType | string;
    category?: string;
    travelTime?: string;
    tags?: string[];
    status?: "pending" | "approved" | "rejected" | "draft" | "deleted" | string;
    authorId?: string;
    authorName?: string;
    createdAt?: { seconds?: number };
    viewCount?: number;
    number?: number;
  };

export type MultilingualDestination = LocalizedDocumentBase & {
  id: string;
  name: LocalizedString;
  summary: LocalizedString;
  region?: LocalizedString;
  heroImage?: string;
  slug?: LocalizedSlug;
};

export type MultilingualGuide = LocalizedDocumentBase & {
  id: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  contentHtml?: LocalizedHtml;
  category?: string;
  image?: string;
};

/** Static province — optional localized maps (fallback to vi strings) */
export type MultilingualProvince = {
  slug: string;
  name: LocalizedString;
  region: LocalizedString;
  summary: LocalizedString;
  image: string;
};
