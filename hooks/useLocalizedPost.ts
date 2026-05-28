"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { resolveArticleTranslation } from "@/lib/posts/articleTranslations";
import type { TravelPost } from "@/lib/travelPost";

export type LocalizedPostView = {
  title: string;
  content: string;
  /** Plain-text excerpt for cards / SEO */
  description: string;
  locale: AppLocale;
  usedFallback: boolean;
};

/** Resolve post article for current UI locale from Firestore `translations` only. */
export function useLocalizedPost(post: TravelPost | null | undefined): LocalizedPostView {
  const locale = useLocale() as AppLocale;

  return useMemo(() => {
    if (!post) {
      return {
        title: "",
        content: "",
        description: "",
        locale,
        usedFallback: false,
      };
    }

    const resolved = resolveArticleTranslation(post, locale);
    return {
      title: resolved.title,
      content: resolved.content,
      description: resolved.description,
      locale: resolved.locale,
      usedFallback: resolved.usedFallback,
    };
  }, [post, locale]);
}
