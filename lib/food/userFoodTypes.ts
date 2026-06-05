/**
 * User food collections stored on `users/{uid}`.
 * @see docs/food-trip-ecosystem.md
 */
import type { Timestamp } from "firebase/firestore";
import type { FoodCategory, BudgetTier } from "@/lib/food/types";

export type SavedFoodRecord = {
  id: string;
  name: string;
  city: string;
  image: string;
  category: FoodCategory;
  priceRange: BudgetTier;
  description: string;
  savedAt: Timestamp | string;
};

export type TripFoodRecord = {
  id: string;
  name: string;
  city: string;
  image: string;
  addedAt: Timestamp | string;
};

export type UserFoodCollections = {
  savedFoods: SavedFoodRecord[];
  tripFoods: TripFoodRecord[];
};

export type FoodAnalyticsEvent = "food_save" | "trip_add" | "ai_generation";

export type FoodAnalyticsRecord = {
  userId: string;
  event: FoodAnalyticsEvent;
  foodId?: string;
  foodName?: string;
  destination?: string;
  locale?: string;
  createdAt: Timestamp | string;
};
