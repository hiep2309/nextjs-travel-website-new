import type { AppLocale } from "@/i18n/routing";
import { getTranslation, getTranslationHtml } from "@/lib/getTranslation";
import { normalizeTravelPost } from "@/lib/firestore/multilingual";
import type { LocalizedSlug } from "@/lib/i18n/types";

export type PostSourceFields = {
  title: string;
  description: string;
  contentHtml: string;
  sourceLocale: AppLocale;
  existingSlugs?: LocalizedSlug;
};

/** Extract author source text from a raw Firestore post document. */
export function extractPostSourceFields(
  id: string,
  raw: Record<string, unknown>,
): PostSourceFields {
  const post = normalizeTravelPost(id, raw);
  const sourceLocale = post.sourceLocale ?? "vi";
  const title = getTranslation(post.title ?? post.name, sourceLocale);
  const description = getTranslation(post.description, sourceLocale);
  const contentHtml = getTranslationHtml(post.contentHtml, sourceLocale);

  return {
    title,
    description: description || title,
    contentHtml,
    sourceLocale,
    existingSlugs: post.slugs,
  };
}
