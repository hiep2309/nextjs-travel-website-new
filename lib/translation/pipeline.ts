import type { AppLocale } from "@/i18n/routing";
import type { LocalizedSlug } from "@/lib/i18n/types";
import {
  buildPostLocaleWritePayload,
  type PostLocaleWritePayload,
} from "@/lib/firestore/multilingual";
import { translatePostFields } from "@/lib/translation/buildLocalizedContent";
import { isGeminiTranslationAvailable } from "@/lib/translation/providers/gemini";
import type { TranslatePostInput, TranslationProvider } from "@/lib/translation/types";

export type PostTranslationPipelineOptions = {
  sourceLocale?: AppLocale;
  provider?: TranslationProvider;
  existingSlugs?: LocalizedSlug;
  slugSuffix?: string;
};

export type PostTranslationPipelineResult = {
  payload: PostLocaleWritePayload;
  geminiConfigured: boolean;
};

/** Full post translation pipeline — AI (Gemini) with MyMemory fallback. */
export async function runPostTranslationPipeline(
  input: TranslatePostInput,
  options: PostTranslationPipelineOptions = {},
): Promise<PostTranslationPipelineResult> {
  const sourceLocale = options.sourceLocale ?? input.sourceLocale ?? "vi";
  const provider = options.provider ?? "auto";

  const fields = await translatePostFields(
    { ...input, sourceLocale },
    { sourceLocale, provider },
  );

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
