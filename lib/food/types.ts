/**
 * AI Food Explorer — domain types.
 *
 * Dish content is multilingual ({ vi, en, ko }) to match the VN Insight i18n model.
 * Numeric/structured fields (price, coords, score) are locale-agnostic.
 */
import type { AppLocale } from "@/i18n/routing";

export type LocalizedText = Record<AppLocale, string>;

export type FoodCategory =
  | "seafood"
  | "street_food"
  | "local_specialties"
  | "vegetarian"
  | "fine_dining";

export type FoodRegion = "north" | "central" | "south";

export type MealTime = "breakfast" | "lunch" | "afternoon" | "dinner" | "late_night";

export type Season = "spring" | "summer" | "autumn" | "winter" | "all_year";

export type BudgetTier = "budget" | "mid" | "premium";

export type Restaurant = {
  name: string;
  area: LocalizedText;
  /** Walking/driving distance from city center, km */
  distanceKm: number;
  priceRange: BudgetTier;
  rating: number;
  reviews: number;
};

export type Dish = {
  id: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  image: string;
  category: FoodCategory;
  region: FoodRegion;
  /** Province/city slugs or display names this dish is iconic in */
  destinations: string[];
  /** Price for one serving in VND */
  priceVnd: number;
  budgetTier: BudgetTier;
  bestTime: MealTime[];
  season: Season;
  /** 0–100 base popularity used as the AI score seed */
  popularity: number;
  trending?: boolean;
  /** Coordinates for the stylized discovery map (0–100 viewport %) */
  map: { x: number; y: number };
  culture: {
    history: LocalizedText;
    significance: LocalizedText;
    traditions: LocalizedText;
  };
  restaurants: Restaurant[];
  nearbyAttractions: LocalizedText[];
};

export type MealTimePreference = MealTime | "any";

export type FoodPreferences = {
  destination: string;
  budget: BudgetTier;
  mealTime: MealTimePreference;
  categories: FoodCategory[];
};

export type ScoredDish = {
  dish: Dish;
  score: number;
  /** Localized reason key fragments resolved in the UI */
  reasons: Array<{ key: string; value?: string }>;
};
