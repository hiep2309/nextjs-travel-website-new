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
};

export const TRAVEL_STYLES: TravelStyle[] = ["Chill", "Adventure", "Food", "Luxury", "Culture"];
export const TRANSPORT_OPTIONS: Transportation[] = ["Car", "Motorbike", "Airplane", "Train"];
export const PACE_OPTIONS: Pace[] = ["Relaxed", "Balanced", "Packed"];

export const DEFAULT_FORM: PlannerFormData = {
  destination: "Đà Nẵng",
  days: 3,
  budget: "5.000.000 VND",
  travelStyle: "Chill",
  travelers: 2,
  transportation: "Airplane",
  pace: "Relaxed",
};
