"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { getTranslation, getTranslationHtml } from "@/lib/getTranslation";
import type { AppLocale } from "@/i18n/routing";
import type { TravelPost } from "@/lib/travelPost";

/** Resolve post title/description/contentHtml for current UI locale (DB only — no runtime MT). */
export function useLocalizedPost(post: TravelPost | null | undefined) {
  const locale = useLocale() as AppLocale;

  return useMemo(() => {
    if (!post) {
      return { title: "", description: "", contentHtml: "", loading: false, locale };
    }

    const title = getTranslation(post.title ?? post.name, locale);
    const description = getTranslation(post.description, locale);
    const contentHtml = getTranslationHtml(post.contentHtml, locale);

    return { title, description, contentHtml, loading: false, locale };
  }, [post, locale]);
}
