import type { AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString } from "@/lib/i18n/types";
import type { ExtendedTargetLocale } from "@/lib/glossary/glossary";

/** @deprecated Gemini-only — kept for API compatibility. */
export type TranslationProvider = "gemini";

export type TranslationContext = "travel-post" | "travel-post-html" | "general";

export type TranslateTextOptions = {
  text: string;
  from: AppLocale;
  to: AppLocale;
  provider?: TranslationProvider;
  context?: TranslationContext;
};

export type TranslateHtmlOptions = {
  context?: TranslationContext;
};

export type TranslateBatchOptions = Omit<TranslateTextOptions, "text">;

export type TranslateTextResult = {
  text: string;
  provider: "gemini" | "none";
  cached: boolean;
};

export type TranslatePostInput = {
  title: string;
  description: string;
  contentHtml: string;
  sourceLocale?: AppLocale;
};

export type TranslatePostResult = {
  title: LocalizedString;
  description: LocalizedString;
  contentHtml: LocalizedHtml;
};

export type TargetLocale = ExtendedTargetLocale;
