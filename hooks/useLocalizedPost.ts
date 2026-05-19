"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { pickLocalized, pickLocalizedHtml } from "@/lib/i18n/content";
import { plainToSimpleHtml, stripHtmlToPlain, translateTextClient } from "@/lib/i18n/machineTranslate";
import type { AppLocale } from "@/i18n/routing";
import type { LocalizedString } from "@/lib/i18n/types";
import type { TravelPost } from "@/lib/travelPost";

function sourceVi(field: LocalizedString | string | undefined | null): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.vi?.trim() || Object.values(field).find((v) => v?.trim())?.trim() || "";
}

function needsMachine(field: LocalizedString | string | undefined | null, locale: AppLocale): boolean {
  if (!field || locale === "vi") return false;
  if (typeof field === "string") return true;
  return !field[locale]?.trim();
}

/** Resolve post title/description/contentHtml for current UI locale (with machine fallback). */
export function useLocalizedPost(post: TravelPost | null | undefined) {
  const locale = useLocale() as AppLocale;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!post) {
      setTitle("");
      setDescription("");
      setContentHtml("");
      setLoading(false);
      return;
    }

    const titleField = post.title ?? post.name;
    const titlePick = pickLocalized(titleField, locale);
    const descPick = pickLocalized(post.description, locale);
    const htmlPick = pickLocalizedHtml(
      (post as { contentHtml?: LocalizedString | string }).contentHtml,
      locale,
    );

    const titleMt = needsMachine(titleField, locale);
    const descMt = needsMachine(post.description, locale);
    const htmlField = (post as { contentHtml?: LocalizedString | string }).contentHtml;
    const htmlMt = needsMachine(htmlField, locale);

    if (!titleMt && !descMt && !htmlMt) {
      setTitle(titlePick);
      setDescription(descPick);
      setContentHtml(htmlPick);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setTitle(titlePick);
    setDescription(descPick);
    setContentHtml(htmlPick);

    (async () => {
      const [t, d, h] = await Promise.all([
        titleMt
          ? translateTextClient(sourceVi(titleField), locale, "vi")
          : Promise.resolve(titlePick),
        descMt
          ? translateTextClient(sourceVi(post.description), locale, "vi")
          : Promise.resolve(descPick),
        htmlMt
          ? translateTextClient(stripHtmlToPlain(sourceVi(htmlField)), locale, "vi").then((plain) =>
              plainToSimpleHtml(plain),
            )
          : Promise.resolve(htmlPick),
      ]);
      if (!cancelled) {
        setTitle(t);
        setDescription(d);
        setContentHtml(h);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post, locale]);

  return { title, description, contentHtml, loading, locale };
}
