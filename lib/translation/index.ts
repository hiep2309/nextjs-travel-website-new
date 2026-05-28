/**
 * Translation pipeline — production multilingual CMS (Gemini-only, pre-translated content).
 *
 * - **UI strings** → next-intl `messages/*.json`
 * - **DB content** → pre-translate on create/edit via `runPostTranslationPipeline`
 * - **Read** → `getTranslation()` / `useLocalizedPost` (no realtime AI on page load)
 */
export type {
  TranslatePostInput,
  TranslatePostResult,
  TranslateTextOptions,
  TranslateTextResult,
  TranslationContext,
  TranslationProvider,
  TargetLocale,
} from "./types";

export { stripHtmlToPlain } from "@/lib/html/htmlValidator";
export { plainToSimpleHtml } from "./htmlUtils";
export {
  translateText,
  translateMany,
  translateHtmlContent,
  translateToEnglish,
  translateToKorean,
  translateToJapanese,
  translateBatch,
  isGeminiTranslationAvailable,
} from "./translation.service";
export { isTranslationFailed, containsVietnamese } from "./translationValidator";
export { translateTextClient } from "./translateTextClient";
export {
  buildLocalizedStringServer,
  buildLocalizedHtmlServer,
  translatePostFields,
} from "./buildLocalizedContent";
export { runPostTranslationPipeline } from "./pipeline";
export { requestPostTranslation } from "./requestPostTranslation";
export type {
  RequestPostTranslationBody,
  RequestPostTranslationResponse,
} from "./requestPostTranslation";
export { extractPostSourceFields } from "./extractPostSource";
export type { PostSourceFields } from "./extractPostSource";
