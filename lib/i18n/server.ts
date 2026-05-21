/**
 * Server-side locale helpers for App Router pages and layouts.
 */
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

/** Validate locale param — calls notFound() when invalid. */
export function parseLocale(raw: string): AppLocale {
  if (!routing.locales.includes(raw as AppLocale)) notFound();
  return raw as AppLocale;
}

/** Call at the top of every [locale] page/layout for static rendering + message loading. */
export function initPageLocale(raw: string): AppLocale {
  const locale = parseLocale(raw);
  setRequestLocale(locale);
  return locale;
}

export function isAppLocale(raw: string): raw is AppLocale {
  return routing.locales.includes(raw as AppLocale);
}
