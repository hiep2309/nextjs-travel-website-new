import type { AppLocale } from "@/i18n/routing";
import { normalizeTravelPost } from "@/lib/firestore/multilingual";
import type { LocalizedSlug } from "@/lib/i18n/types";
import { resolvePostTranslation } from "@/lib/posts/postTranslations";

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
  const resolved = resolvePostTranslation(post, sourceLocale);

  return {
    title: resolved.title,
    description: resolved.description || resolved.title,
    contentHtml: resolved.contentHtml,
    sourceLocale,
    existingSlugs: post.slugs,
  };
}
