import type { AppLocale } from "@/i18n/routing";
import { getTranslation } from "@/lib/getTranslation";
import type { SavedItineraryRecord } from "@/lib/itinerary/types";

export function getItineraryTitle(record: SavedItineraryRecord, locale: AppLocale): string {
  return getTranslation(record.title, locale) || getTranslation(record.title, record.locale);
}

export function getItineraryDestination(record: SavedItineraryRecord, locale: AppLocale): string {
  return (
    getTranslation(record.destination, locale) ||
    getTranslation(record.destination, record.locale) ||
    record.plan.destination
  );
}

export function getItinerarySummary(record: SavedItineraryRecord, locale: AppLocale): string {
  return getTranslation(record.summary, locale) || getTranslation(record.summary, record.locale);
}

export function formatItineraryDate(date: Date, locale: AppLocale): string {
  const tag = locale === "ko" ? "ko-KR" : locale === "en" ? "en-US" : "vi-VN";
  return date.toLocaleDateString(tag, { day: "2-digit", month: "2-digit", year: "numeric" });
}
