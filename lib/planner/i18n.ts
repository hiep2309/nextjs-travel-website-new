import type { AppLocale } from "@/i18n/routing";
import enMessages from "@/messages/en.json";
import koMessages from "@/messages/ko.json";
import viMessages from "@/messages/vi.json";
import type { Pace, PlannerFormData, Transportation, TravelStyle } from "@/lib/planner/types";

/** Canonical activity categories — AI must return these keys; UI maps via AiPlanner `cat_*`. */
export const PLANNER_CATEGORIES = [
  "food",
  "culture",
  "adventure",
  "sightseeing",
  "transport",
  "relax",
  "photo",
  "hidden",
  "other",
] as const;

export type PlannerCategory = (typeof PLANNER_CATEGORIES)[number];

type PlannerMessages = Record<string, string>;

const MESSAGE_MAP: Record<AppLocale, PlannerMessages> = {
  vi: viMessages.AiPlanner,
  en: enMessages.AiPlanner,
  ko: koMessages.AiPlanner,
};

function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}

/** Server-side AiPlanner copy (API / Gemini — no request locale context needed). */
export function plannerT(
  locale: AppLocale,
  key: string,
  values?: Record<string, string | number>,
): string {
  const bucket = MESSAGE_MAP[locale] ?? MESSAGE_MAP.vi;
  return interpolate(bucket[key] ?? MESSAGE_MAP.vi[key] ?? key, values);
}

export function getStyleLabel(locale: AppLocale, style: TravelStyle): string {
  return plannerT(locale, `style_${style}`);
}

export function getTransportLabel(locale: AppLocale, transport: Transportation): string {
  return plannerT(locale, `transport_${transport}`);
}

export function getPaceLabel(locale: AppLocale, pace: Pace): string {
  return plannerT(locale, `pace_${pace}`);
}

const DEFAULTS: Record<AppLocale, Pick<PlannerFormData, "destination" | "budget">> = {
  vi: { destination: "Đà Nẵng", budget: "5.000.000 VND" },
  en: { destination: "Da Nang", budget: "5,000,000 VND" },
  ko: { destination: "다낭", budget: "5,000,000 VND" },
};

export function getDefaultPlannerForm(locale: AppLocale): PlannerFormData {
  const localized = DEFAULTS[locale] ?? DEFAULTS.vi;
  return {
    destination: localized.destination,
    days: 3,
    budget: localized.budget,
    travelStyle: "Chill",
    travelers: 2,
    transportation: "Airplane",
    pace: "Relaxed",
    locale,
  };
}

export function costFormatInstruction(locale: AppLocale): string {
  if (locale === "vi") {
    return 'Estimate costs in Vietnamese Dong using format like "300.000 VND" (dot thousands separator).';
  }
  return 'Estimate costs in Vietnamese Dong using format like "300,000 VND".';
}

export function localeOutputInstruction(locale: AppLocale): string {
  if (locale === "en") {
    return "Write ALL text fields (trip_title, theme, place_name, description, tips, hidden_gems names/descriptions) in English.";
  }
  if (locale === "ko") {
    return "Write ALL text fields (trip_title, theme, place_name, description, tips, hidden_gems names/descriptions) in Korean.";
  }
  return "Write place names and descriptions in Vietnamese when the destination is in Vietnam.";
}

/** Map AI category string to a known key for UI translation. */
export function normalizePlannerCategory(raw: string): PlannerCategory | null {
  const key = raw.trim().toLowerCase();
  if ((PLANNER_CATEGORIES as readonly string[]).includes(key)) {
    return key as PlannerCategory;
  }
  return null;
}

export function isPlannerCategoryKey(raw: string): raw is PlannerCategory {
  return normalizePlannerCategory(raw) !== null;
}

/** Group key for cost breakdown — canonical slug or "other". */
export function plannerCategoryGroupKey(raw: string | undefined | null): PlannerCategory {
  return normalizePlannerCategory(raw ?? "") ?? "other";
}
