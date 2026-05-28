"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import {
  logPostTranslationDebug,
  resolvePostTranslation,
} from "@/lib/posts/postTranslations";
import type { TravelPost } from "@/lib/travelPost";

export type LocalizedPostView = {
  title: string;
  description: string;
  contentHtml: string;
  locale: AppLocale;
  titleFrom: string;
  contentFrom: string;
  usedContentFallback: boolean;
  availableLocales: string[];
};

/** Resolve post title/body for current UI locale from `post.translations` (DB only). */
export function useLocalizedPost(post: TravelPost | null | undefined): LocalizedPostView {
  const locale = useLocale() as AppLocale;

  const resolved = useMemo(() => {
    if (!post) {
      return {
        title: "",
        description: "",
        contentHtml: "",
        locale,
        titleFrom: locale,
        contentFrom: locale,
        usedContentFallback: false,
        availableLocales: [] as string[],
      };
    }

    const r = resolvePostTranslation(post, locale);
    return {
      title: r.title,
      description: r.description,
      contentHtml: r.contentHtml,
      locale: r.locale,
      titleFrom: r.titleFrom,
      contentFrom: r.contentFrom,
      usedContentFallback: r.usedContentFallback,
      availableLocales: r.availableLocales,
    };
  }, [post, locale]);

  useEffect(() => {
    if (!post?.id) return;
    logPostTranslationDebug(post.id, resolvePostTranslation(post, locale));
  }, [post, locale]);

  return resolved;
}
