/**
 * Locale routing — single source of truth for supported languages and URL prefixes.
 */
import { defineRouting } from "next-intl/routing";

export const locales = ["vi", "en", "ko"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "vi";

export const localeLabels: Record<AppLocale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  ko: "한국어",
};

/** BCP 47 tags for hreflang / Open Graph */
export const localeToHrefLang: Record<AppLocale, string> = {
  vi: "vi-VN",
  en: "en",
  ko: "ko",
};

/** Cookie used by next-intl middleware to persist user language choice */
export const LOCALE_COOKIE = "NEXT_LOCALE" as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: 60 * 60 * 24 * 365,
  },
});
