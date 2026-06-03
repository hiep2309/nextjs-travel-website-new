/** Popular ready-made itinerary templates shown on the empty AI Trip Planner panel. */
import type { AppLocale } from "@/i18n/routing";
import type { TravelStyle } from "@/lib/planner/types";

export type PlannerTemplateIcon = "beach" | "culture" | "mountain" | "city";

export type PlannerTemplate = {
  id: string;
  destination: Record<AppLocale, string>;
  days: number;
  rating: number;
  travelStyle: TravelStyle;
  budgetVnd: number;
  icon: PlannerTemplateIcon;
};

export const POPULAR_TEMPLATES: PlannerTemplate[] = [
  {
    id: "da-nang-3",
    destination: { vi: "Đà Nẵng", en: "Da Nang", ko: "다낭" },
    days: 3,
    rating: 4.9,
    travelStyle: "Chill",
    budgetVnd: 5_000_000,
    icon: "beach",
  },
  {
    id: "hoi-an-2",
    destination: { vi: "Hội An", en: "Hoi An", ko: "호이안" },
    days: 2,
    rating: 4.8,
    travelStyle: "Culture",
    budgetVnd: 3_500_000,
    icon: "culture",
  },
  {
    id: "da-lat-4",
    destination: { vi: "Đà Lạt", en: "Da Lat", ko: "달랏" },
    days: 4,
    rating: 4.9,
    travelStyle: "Adventure",
    budgetVnd: 6_000_000,
    icon: "mountain",
  },
  {
    id: "ho-chi-minh-2",
    destination: { vi: "Hồ Chí Minh", en: "Ho Chi Minh City", ko: "호치민" },
    days: 2,
    rating: 4.7,
    travelStyle: "Food",
    budgetVnd: 4_000_000,
    icon: "city",
  },
];

/** Format a VND budget to match the planner's locale convention ("5.000.000 VND" / "5,000,000 VND"). */
export function formatPlannerBudget(vnd: number, locale: AppLocale): string {
  const grouped = vnd.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
  return `${grouped} VND`;
}
