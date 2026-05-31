import type { LocalizedSlug } from "@/lib/i18n/types";
import {
  buildPostLocaleWritePayload,
  type PostLocaleWritePayload,
} from "@/lib/firestore/multilingual";
import {
  buildLocalizedMapsFromSource,
  listMissingManualLocales,
  mergeManualDraftsIntoPayload,
  type ManualArticleDrafts,
} from "@/lib/posts/manualArticleLocales";
import { requestPostTranslation } from "@/lib/translation/requestPostTranslation";

export type BuildPostSavePayloadInput = {
  viTitle: string;
  viContentHtml: string;
  viDescription: string;
  manualDrafts?: ManualArticleDrafts;
  existingSlugs?: LocalizedSlug;
  slugSuffix?: string;
  /** When true, never call Gemini — save vi + any manual locales only. */
  manualOnly?: boolean;
};

export type BuildPostSavePayloadResult = {
  payload: PostLocaleWritePayload;
  source: "manual" | "ai" | "ai+manual" | "vi-only";
};

/**
 * Build Firestore write payload for a post.
 * Priority: manual EN/KO → AI for missing locales → Vietnamese-only fallback.
 */
export async function buildPostSavePayload(
  input: BuildPostSavePayloadInput,
): Promise<BuildPostSavePayloadResult> {
  const manualDrafts = input.manualDrafts ?? {};
  const missing = listMissingManualLocales(manualDrafts);
  const options = {
    sourceLocale: "vi" as const,
    existingSlugs: input.existingSlugs,
    slugSuffix: input.slugSuffix,
  };

  if (input.manualOnly || missing.length === 0) {
    const { title, contentHtml } = buildLocalizedMapsFromSource(
      input.viTitle,
      input.viContentHtml,
      manualDrafts,
    );
    return {
      payload: buildPostLocaleWritePayload(title, contentHtml, options),
      source: missing.length === 0 && (manualDrafts.en || manualDrafts.ko) ? "manual" : "vi-only",
    };
  }

  try {
    const aiPayload = await requestPostTranslation({
      title: input.viTitle,
      description: input.viDescription,
      contentHtml: input.viContentHtml,
      sourceLocale: "vi",
      existingSlugs: input.existingSlugs,
      slugSuffix: input.slugSuffix,
    });

    const hasManual = Boolean(manualDrafts.en || manualDrafts.ko);
    const payload = hasManual
      ? mergeManualDraftsIntoPayload(aiPayload, input.viTitle, input.viContentHtml, manualDrafts)
      : aiPayload;

    return { payload, source: hasManual ? "ai+manual" : "ai" };
  } catch {
    const { title, contentHtml } = buildLocalizedMapsFromSource(
      input.viTitle,
      input.viContentHtml,
      manualDrafts,
    );
    return {
      payload: buildPostLocaleWritePayload(title, contentHtml, options),
      source: title.en || title.ko ? "manual" : "vi-only",
    };
  }
}
