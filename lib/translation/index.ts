/**
 * Translation helpers — machine translation for Firestore content (not UI strings).
 *
 * - **Read** localized DB fields → `getTranslation()` from `@/lib/getTranslation`
 * - **Write** localized fields → `buildLocalizedString` / `translatePostFields`
 * - **UI** copy → next-intl `messages/*.json`
 */
export type {
  TranslatePostInput,
  TranslatePostResult,
  TranslateTextOptions,
  TranslateTextResult,
  TranslationContext,
  TranslationProvider,
} from "./types";

export { stripHtmlToPlain, plainToSimpleHtml } from "./htmlUtils";
export { translateText, translateMany } from "./translateText";
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
export { isGeminiTranslationAvailable } from "./providers/gemini";
