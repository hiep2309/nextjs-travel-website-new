import type { LocalizedHtml, LocalizedString, PostTranslations } from "@/lib/i18n/types";
import type { PostLocaleWritePayload } from "@/lib/firestore/multilingual";
import {
  buildArticleTranslationsWritePayload,
  deriveLocalizedMapsFromTranslations,
} from "@/lib/posts/articleTranslations";
import { normalizeArticleContentHtml } from "@/lib/posts/articleContentHtml";

export type ManualLocaleDraft = {
  title: string;
  content: string;
};

export type ManualArticleDrafts = {
  en?: ManualLocaleDraft;
  ko?: ManualLocaleDraft;
};

const TARGETS = ["en", "ko"] as const;
type ManualTargetLocale = (typeof TARGETS)[number];

export function isManualLocaleComplete(draft: ManualLocaleDraft | undefined): boolean {
  return Boolean(draft?.title.trim() && draft?.content.trim());
}

export function hasAnyManualDraft(drafts: ManualArticleDrafts): boolean {
  return isManualLocaleComplete(drafts.en) || isManualLocaleComplete(drafts.ko);
}

export function listMissingManualLocales(drafts: ManualArticleDrafts): ManualTargetLocale[] {
  return TARGETS.filter((loc) => !isManualLocaleComplete(drafts[loc]));
}

/** Merge Vietnamese source + optional manual EN/KO into localized maps. */
export function buildLocalizedMapsFromSource(
  viTitle: string,
  viContentHtml: string,
  drafts: ManualArticleDrafts = {},
): { title: LocalizedString; contentHtml: LocalizedHtml } {
  const title: LocalizedString = { vi: viTitle.trim() };
  const contentHtml: LocalizedHtml = { vi: normalizeArticleContentHtml(viContentHtml.trim()) };

  for (const loc of TARGETS) {
    const draft = drafts[loc as ManualTargetLocale];
    if (!isManualLocaleComplete(draft)) continue;
    title[loc] = draft!.title.trim();
    contentHtml[loc] = normalizeArticleContentHtml(draft!.content.trim());
  }

  return { title, contentHtml };
}

/** Overlay manual copies onto an AI-generated payload (manual wins). */
export function mergeManualDraftsIntoPayload(
  payload: PostLocaleWritePayload,
  viTitle: string,
  viContentHtml: string,
  drafts: ManualArticleDrafts,
): PostLocaleWritePayload {
  const { title, contentHtml } = buildLocalizedMapsFromSource(viTitle, viContentHtml, drafts);
  const translations = buildArticleTranslationsWritePayload(title, contentHtml);
  const derived = deriveLocalizedMapsFromTranslations(translations);

  return {
    ...payload,
    translations,
    title: derived.title,
    description: derived.description,
    contentHtml: derived.contentHtml,
    seo: payload.seo,
  };
}

/** Read manual drafts from Firestore `translations` or legacy maps. */
export function readManualDraftsFromPost(raw: Record<string, unknown>): ManualArticleDrafts {
  const out: ManualArticleDrafts = {};
  const translations = raw.translations;

  for (const loc of TARGETS) {
    let title = "";
    let content = "";

    if (translations && typeof translations === "object" && !Array.isArray(translations)) {
      const entry = (translations as Record<string, unknown>)[loc];
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const e = entry as Record<string, unknown>;
        title = typeof e.title === "string" ? e.title : "";
        content =
          typeof e.content === "string"
            ? e.content
            : typeof e.contentHtml === "string"
              ? e.contentHtml
              : "";
      }
    }

    if (!title || !content) {
      const titleMap = raw.title;
      const htmlMap = raw.contentHtml;
      if (titleMap && typeof titleMap === "object") {
        const v = (titleMap as Record<string, string>)[loc];
        if (typeof v === "string" && v.trim()) title = v;
      }
      if (htmlMap && typeof htmlMap === "object") {
        const v = (htmlMap as Record<string, string>)[loc];
        if (typeof v === "string" && v.trim()) content = v;
      }
    }

    if (title.trim() && content.trim()) {
      out[loc as ManualTargetLocale] = { title: title.trim(), content: content.trim() };
    }
  }

  return out;
}

export function draftsToTranslations(drafts: ManualArticleDrafts): PostTranslations {
  const title: LocalizedString = {};
  const contentHtml: LocalizedHtml = {};
  for (const loc of TARGETS) {
    const draft = drafts[loc as ManualTargetLocale];
    if (!isManualLocaleComplete(draft)) continue;
    title[loc] = draft!.title.trim();
    contentHtml[loc] = draft!.content.trim();
  }
  return buildArticleTranslationsWritePayload(title, contentHtml);
}
