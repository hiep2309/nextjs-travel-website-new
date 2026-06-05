import type { AppLocale } from "@/i18n/routing";

export type TravelStyle = "Chill" | "Adventure" | "Food" | "Luxury" | "Culture";
export type Transportation = "Car" | "Motorbike" | "Airplane" | "Train";
export type Pace = "Relaxed" | "Balanced" | "Packed";

export type PlannerFormData = {
  destination: string;
  days: number;
  budget: string;
  travelStyle: TravelStyle;
  travelers: number;
  transportation: Transportation;
  pace: Pace;
  locale?: AppLocale;
  /** Use gemini-2.5-flash for richer plans (uses more quota). */
  premiumMode?: boolean;
};

export type TripActivity = {
  time: string;
  place_name: string;
  description: string;
  estimated_cost: string;
  category: string;
  tips: string;
};

export type TripDay = {
  day: number;
  theme: string;
  activities: TripActivity[];
};

export type HiddenGem = {
  name: string;
  description: string;
};

export type TripPlan = {
  trip_title: string;
  destination: string;
  total_estimated_cost: string;
  days: TripDay[];
  hidden_gems: HiddenGem[];
  /** Dish names woven into the itinerary (from AI + user tripFoods). */
  local_food?: string[];
};

/** How the itinerary was produced. */
export type TripPlanSource = "ai" | "cache" | "fallback";

export type TripPlanFallbackReason = "quota" | "error" | "unconfigured";

export type TripPlanMeta = {
  source: TripPlanSource;
  fallbackReason?: TripPlanFallbackReason;
  cachedAt?: number;
  cacheLayer?: "memory" | "firestore";
  model?: string;
  tokensUsed?: number;
  usage?: {
    count: number;
    limit: number;
    remaining: number;
  };
};

export type TripPlanResult = {
  plan: TripPlan;
  meta: TripPlanMeta;
};

export const TRAVEL_STYLES: TravelStyle[] = ["Chill", "Adventure", "Food", "Luxury", "Culture"];
export const TRANSPORT_OPTIONS: Transportation[] = ["Car", "Motorbike", "Airplane", "Train"];
export const PACE_OPTIONS: Pace[] = ["Relaxed", "Balanced", "Packed"];

/** Non-locale defaults — use `getDefaultPlannerForm(locale)` for full form state. */
export const PLANNER_FORM_BASE: Omit<PlannerFormData, "destination" | "budget" | "locale"> = {
  days: 3,
  travelStyle: "Chill",
  travelers: 2,
  transportation: "Airplane",
  pace: "Relaxed",
};
