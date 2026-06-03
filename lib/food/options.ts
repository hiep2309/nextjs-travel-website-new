/** Shared option lists & helpers for the AI Food Explorer UI. */
import type {
  BudgetTier,
  FoodCategory,
  FoodPreferences,
  MealTime,
  MealTimePreference,
} from "@/lib/food/types";

export { DESTINATION_OPTIONS } from "@/lib/destinations";

export const FOOD_CATEGORIES: FoodCategory[] = [
  "seafood",
  "street_food",
  "local_specialties",
  "vegetarian",
  "fine_dining",
];

export const BUDGET_TIERS: BudgetTier[] = ["budget", "mid", "premium"];

export const MEAL_TIMES: MealTime[] = [
  "breakfast",
  "lunch",
  "afternoon",
  "dinner",
  "late_night",
];

export const MEAL_TIME_OPTIONS: MealTimePreference[] = ["any", ...MEAL_TIMES];

export const DEFAULT_PREFERENCES: FoodPreferences = {
  destination: "",
  budget: "mid",
  mealTime: "any",
  categories: [],
};

export function formatVnd(value: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString()}₫`;
  }
}
