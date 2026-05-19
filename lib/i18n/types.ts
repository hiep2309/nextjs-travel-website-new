/**
 * Firestore multilingual content types.
 *
 * Store translations as nested maps keyed by locale code.
 * Example: { vi: "Hà Nội", en: "Hanoi", ko: "하노이" }
 */
import type { AppLocale } from "@/i18n/routing";

export type LocalizedString = Partial<Record<AppLocale, string>> & {
  vi?: string;
};

export type LocalizedSlug = Partial<Record<AppLocale, string>>;

export type LocalizedSeo = Partial<
  Record<
    AppLocale,
    {
      title?: string;
      description?: string;
      keywords?: string[];
    }
  >
>;

/** Base fields every localized Firestore document should include */
export type LocalizedDocumentBase = {
  /** Canonical locale used when creating content (author's language) */
  sourceLocale?: AppLocale;
  /** Per-locale slugs for SEO URLs */
  slugs?: LocalizedSlug;
  /** Per-locale SEO overrides */
  seo?: LocalizedSeo;
  /** Translation workflow status per locale */
  translationStatus?: Partial<
    Record<AppLocale, "draft" | "machine" | "reviewed" | "published">
  >;
  updatedAt?: { seconds?: number };
};

export type MultilingualPost = LocalizedDocumentBase & {
  id: string;
  title?: LocalizedString;
  description?: LocalizedString;
  contentHtml?: Partial<Record<AppLocale, string>>;
  image?: string;
  region?: string;
  status?: string;
};

export type MultilingualDestination = LocalizedDocumentBase & {
  id: string;
  name?: LocalizedString;
  summary?: LocalizedString;
  heroImage?: string;
};
