/**
 * Canonical multilingual article shape for Firestore `posts`.
 *
 * UI chrome → messages/*.json (next-intl)
 * Article body → `translations.{vi|en|ko}.{title, content}`
 */
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString, PostTranslations } from "@/lib/i18n/types";
import type { TravelPost } from "@/lib/travelPost";

export type ArticleTranslation = {
  title: string;
  content: string;
};

export type ResolvedArticle = {
  locale: AppLocale;
  title: string;
  content: string;
  /** Plain-text excerpt for cards / SEO */
  description: string;
  usedFallback: boolean;
};

function plainTextExcerpt(html: string, max = 160): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function hasArticleEntry(entry: ArticleTranslation | undefined): boolean {
  return Boolean(entry?.title?.trim() || entry?.content?.trim());
}

/** Build `translations` from legacy localized maps (read-time migration). */
export function buildTranslationsFromLegacyMaps(
  title: LocalizedString,
  contentHtml: LocalizedHtml,
  description?: LocalizedString,
): PostTranslations {
  const out: PostTranslations = {};

  for (const loc of locales) {
    const t = title[loc]?.trim() ?? "";
    const c = contentHtml[loc]?.trim() ?? "";
    const d = description?.[loc]?.trim() ?? "";
    if (t || c) {
      out[loc] = { title: t, content: c };
    } else if (d) {
      out[loc] = { title: t, content: `<p>${d}</p>` };
    }
  }

  return out;
}

/** Parse Firestore `translations` object; merge with legacy maps when needed. */
export function normalizeArticleTranslations(
  raw: unknown,
  title: LocalizedString,
  contentHtml: LocalizedHtml,
  description?: LocalizedString,
): PostTranslations {
  const legacy = buildTranslationsFromLegacyMaps(title, contentHtml, description);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return legacy;
  }

  const parsed: PostTranslations = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (key !== "vi" && key !== "en" && key !== "ko") continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    const entry = value as Record<string, unknown>;
    const loc = key as AppLocale;
    const entryTitle = typeof entry.title === "string" ? entry.title.trim() : "";
    const entryContent =
      typeof entry.content === "string"
        ? entry.content.trim()
        : typeof entry.contentHtml === "string"
          ? entry.contentHtml.trim()
          : "";

    if (entryTitle || entryContent) {
      parsed[loc] = { title: entryTitle, content: entryContent };
    }
  }

  const out: PostTranslations = {};
  for (const loc of locales) {
    const p = parsed[loc];
    const l = legacy[loc];
    if (!p && !l) continue;
    out[loc] = {
      title: p?.title?.trim() || l?.title?.trim() || "",
      content: p?.content?.trim() || l?.content?.trim() || "",
    };
  }
  return out;
}

/** Write payload — single canonical `translations` object. */
export function buildArticleTranslationsWritePayload(
  title: LocalizedString,
  contentHtml: LocalizedHtml,
): PostTranslations {
  const out: PostTranslations = {};
  for (const loc of locales) {
    const t = title[loc]?.trim() ?? "";
    const c = contentHtml[loc]?.trim() ?? "";
    if (t || c) {
      out[loc] = { title: t, content: c };
    }
  }
  return out;
}

/** Derive legacy maps from canonical translations (search, SEO helpers). */
export function deriveLocalizedMapsFromTranslations(translations: PostTranslations): {
  title: LocalizedString;
  description: LocalizedString;
  contentHtml: LocalizedHtml;
} {
  const title: LocalizedString = {};
  const description: LocalizedString = {};
  const contentHtml: LocalizedHtml = {};

  for (const loc of locales) {
    const entry = translations[loc];
    if (!entry) continue;
    if (entry.title?.trim()) title[loc] = entry.title.trim();
    if (entry.content?.trim()) {
      contentHtml[loc] = entry.content.trim();
      description[loc] = plainTextExcerpt(entry.content);
    }
  }

  return { title, description, contentHtml };
}

/**
 * Resolve article for UI locale.
 * Fallback: entire block from Vietnamese when locale copy is missing.
 */
export function resolveArticleTranslation(
  post: Pick<TravelPost, "translations" | "title" | "description" | "contentHtml">,
  locale: AppLocale,
): ResolvedArticle {
  const translations =
    post.translations ??
    buildTranslationsFromLegacyMaps(post.title, post.contentHtml, post.description);

  const localized = translations[locale];
  const vietnamese = translations[defaultLocale];

  const useFallback = !hasArticleEntry(localized);
  const current = useFallback ? vietnamese : localized;

  const title = current?.title?.trim() ?? "";
  const content = current?.content?.trim() ?? "";

  return {
    locale: useFallback ? defaultLocale : locale,
    title,
    content,
    description: plainTextExcerpt(content),
    usedFallback: useFallback && locale !== defaultLocale,
  };
}

export function listArticleContentLocales(post: TravelPost): AppLocale[] {
  const translations =
    post.translations ??
    buildTranslationsFromLegacyMaps(post.title, post.contentHtml, post.description);
  return locales.filter((loc) => Boolean(translations[loc]?.content?.trim()));
}
