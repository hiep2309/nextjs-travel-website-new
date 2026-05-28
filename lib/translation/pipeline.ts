import type { AppLocale } from "@/i18n/routing";
import type { LocalizedSlug } from "@/lib/i18n/types";
import {
  buildPostLocaleWritePayload,
  type PostLocaleWritePayload,
} from "@/lib/firestore/multilingual";
import { translatePostFields } from "@/lib/translation/buildLocalizedContent";
import { isGeminiTranslationAvailable } from "@/lib/translation/translation.service";
import type { TranslatePostInput } from "@/lib/translation/types";

export type PostTranslationPipelineOptions = {
  sourceLocale?: AppLocale;
  existingSlugs?: LocalizedSlug;
  slugSuffix?: string;
};

export type PostTranslationPipelineResult = {
  payload: PostLocaleWritePayload;
  geminiConfigured: boolean;
};

/**
 * Pre-translate post on create/edit — generates vi/en/ko fields before Firestore write.
 * Frontend renders stored locales only (no realtime page translation).
 */
export async function runPostTranslationPipeline(
  input: TranslatePostInput,
  options: PostTranslationPipelineOptions = {},
): Promise<PostTranslationPipelineResult> {
  const sourceLocale = options.sourceLocale ?? input.sourceLocale ?? "vi";

  const fields = await translatePostFields({ ...input, sourceLocale }, { sourceLocale });

  const payload = buildPostLocaleWritePayload(
    fields.title,
    fields.description,
    fields.contentHtml,
    {
      sourceLocale,
      existingSlugs: options.existingSlugs,
      slugSuffix: options.slugSuffix,
    },
  );

  return {
    payload,
    geminiConfigured: isGeminiTranslationAvailable(),
  };
}
