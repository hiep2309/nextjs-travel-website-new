import type { AppLocale } from "@/i18n/routing";
import type { LocalizedHtml, LocalizedString } from "@/lib/i18n/types";

export type TranslationProvider = "auto" | "gemini" | "mymemory";

export type TranslationContext = "travel-post" | "general";

export type TranslateTextOptions = {
  text: string;
  from: AppLocale;
  to: AppLocale;
  provider?: TranslationProvider;
  context?: TranslationContext;
};

export type TranslateTextResult = {
  text: string;
  provider: "gemini" | "mymemory" | "none";
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
