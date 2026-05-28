/**
 * Firestore multilingual helpers — normalize legacy docs, build write payloads, search.
 */
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";
import type {
  LocalizedDocumentBase,
  LocalizedHtml,
  LocalizedSeo,
  LocalizedSlug,
  LocalizedString,
  PostTranslations,
  TranslationStatusMap,
} from "@/lib/i18n/types";
import {
  buildPostTranslationsWritePayload,
  normalizePostTranslations,
} from "@/lib/posts/postTranslations";
import type { TravelPost } from "@/lib/travelPost";

/** Coerce legacy plain string or partial map into LocalizedString. */
export function normalizeLocalizedString(
  raw: unknown,
  legacyFallback?: string,
): LocalizedString {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const map = raw as Record<string, unknown>;
    const out: LocalizedString = {};
    for (const loc of locales) {
      const v = map[loc];
      if (typeof v === "string" && v.trim()) out[loc] = v.trim();
    }
    if (Object.keys(out).length > 0) return out;
  }
  const plain =
    (typeof raw === "string" ? raw : legacyFallback)?.trim() ||
    (typeof raw === "number" ? String(raw) : "") ||
    "";
  return plain ? { vi: plain } : { vi: "" };
}

export function normalizeLocalizedHtml(raw: unknown, legacyFallback?: string): LocalizedHtml {
  return normalizeLocalizedString(raw, legacyFallback) as LocalizedHtml;
}

export function normalizeLocalizedSlug(
  slugs: unknown,
  legacySlug?: string,
  title?: LocalizedString,
): LocalizedSlug {
  if (slugs && typeof slugs === "object" && !Array.isArray(slugs)) {
    const map = slugs as Record<string, unknown>;
    const out: LocalizedSlug = {};
    for (const loc of locales) {
      const v = map[loc];
      if (typeof v === "string" && v.trim()) out[loc] = v.trim();
    }
    if (Object.keys(out).length > 0) return out;
  }
  const base = legacySlug?.trim() || slugify(title?.vi ?? title?.en ?? "post");
  return { vi: base, en: base, ko: base };
}

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return s || "post";
}

export function buildPostSlugs(title: LocalizedString, suffix?: string): LocalizedSlug {
  const token = suffix ?? Date.now().toString(36);
  const out: LocalizedSlug = {};
  for (const loc of locales) {
    const source = title[loc]?.trim() || title.vi?.trim() || title.en?.trim();
    if (source) out[loc] = `${slugify(source)}-${token}`;
  }
  if (!out.vi && title.vi) out.vi = `${slugify(title.vi)}-${token}`;
  return out;
}

export function buildPostSeo(title: LocalizedString, description: LocalizedString): LocalizedSeo {
  const seo: LocalizedSeo = {};
  for (const loc of locales) {
    const t = title[loc]?.trim();
    const d = description[loc]?.trim();
    if (!t && !d) continue;
    seo[loc] = {
      title: t ? `${t} | VN Insight` : undefined,
      description: d ? d.replace(/\s+/g, " ").slice(0, 160) : undefined,
    };
  }
  return seo;
}

export function defaultTranslationStatus(
  sourceLocale: AppLocale = defaultLocale,
): TranslationStatusMap {
  return {
    vi: sourceLocale === "vi" ? "published" : "machine",
    en: sourceLocale === "en" ? "published" : "machine",
    ko: sourceLocale === "ko" ? "published" : "machine",
  };
}

/** Normalize raw Firestore document → canonical TravelPost (client or server). */
export function normalizeTravelPost(id: string, raw: Record<string, unknown>): TravelPost {
  const legacyName = typeof raw.name === "string" ? raw.name : undefined;
  const legacySlug = typeof raw.slug === "string" ? raw.slug : undefined;

  const title = normalizeLocalizedString(raw.title, legacyName);
  if (!title.vi && legacyName) title.vi = legacyName;

  const description = normalizeLocalizedString(raw.description);
  const contentHtml = normalizeLocalizedHtml(raw.contentHtml);
  const translations = normalizePostTranslations(
    raw.translations,
    title,
    description,
    contentHtml,
  );
  const slugs = normalizeLocalizedSlug(raw.slugs, legacySlug, title);

  let seo = raw.seo as LocalizedSeo | undefined;
  if (!seo || typeof seo !== "object" || !Object.keys(seo).length) {
    seo = buildPostSeo(title, description);
  }

  const translationStatus =
    (raw.translationStatus as TranslationStatusMap | undefined) ??
    defaultTranslationStatus((raw.sourceLocale as AppLocale) ?? defaultLocale);

  return {
    id,
    title,
    description,
    contentHtml,
    translations,
    slugs,
    seo,
    translationStatus,
    sourceLocale: (raw.sourceLocale as AppLocale) ?? defaultLocale,
    name: legacyName,
    slug: legacySlug,
    image:
      typeof raw.image === "string" && raw.image.trim()
        ? raw.image.trim()
        : Array.isArray(raw.images) && typeof raw.images[0] === "string" && raw.images[0].trim()
          ? raw.images[0].trim()
          : typeof raw.thumb === "string" && raw.thumb.trim()
            ? raw.thumb.trim()
            : undefined,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : undefined,
    thumb: typeof raw.thumb === "string" ? raw.thumb : undefined,
    region: typeof raw.region === "string" ? raw.region : undefined,
    regionKey: typeof raw.regionKey === "string" ? raw.regionKey : undefined,
    country: typeof raw.country === "string" ? raw.country : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
    postType: typeof raw.postType === "string" ? raw.postType : undefined,
    travelTime: typeof raw.travelTime === "string" ? raw.travelTime : undefined,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : undefined,
    createdAt: raw.createdAt as TravelPost["createdAt"],
    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : undefined,
    commentCount: typeof raw.commentCount === "number" ? raw.commentCount : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    authorId: typeof raw.authorId === "string" ? raw.authorId : undefined,
    authorName: typeof raw.authorName === "string" ? raw.authorName : undefined,
    number: typeof raw.number === "number" ? raw.number : undefined,
  };
}

/** Concatenate all locale values for search indexing. */
export function flattenLocalizedForSearch(
  field: LocalizedString | string | undefined | null,
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return locales
    .map((loc) => field[loc]?.trim())
    .filter(Boolean)
    .join(" ");
}

export type PostLocaleWritePayload = {
  title: LocalizedString;
  description: LocalizedString;
  contentHtml: LocalizedHtml;
  translations: PostTranslations;
  slugs: LocalizedSlug;
  seo: LocalizedSeo;
  sourceLocale: AppLocale;
  translationStatus: TranslationStatusMap;
};

/** Fields written on create/update after machine translation. */
export function buildPostLocaleWritePayload(
  title: LocalizedString,
  description: LocalizedString,
  contentHtml: LocalizedHtml,
  options?: { sourceLocale?: AppLocale; slugSuffix?: string; existingSlugs?: LocalizedSlug },
): PostLocaleWritePayload {
  const sourceLocale = options?.sourceLocale ?? defaultLocale;
  const slugs =
    options?.existingSlugs && Object.keys(options.existingSlugs).length > 0
      ? options.existingSlugs
      : buildPostSlugs(title, options?.slugSuffix);

  return {
    title,
    description,
    contentHtml,
    translations: buildPostTranslationsWritePayload(title, description, contentHtml),
    slugs,
    seo: buildPostSeo(title, description),
    sourceLocale,
    translationStatus: defaultTranslationStatus(sourceLocale),
  };
}

export const MULTILINGUAL_POST_SCHEMA = {
  required: ["title", "description", "contentHtml", "translations"],
  localizedFields: ["title", "description", "contentHtml", "translations", "slugs", "seo"] as const,
  metaFields: ["sourceLocale", "translationStatus", "updatedAt"] as const,
} as const;
