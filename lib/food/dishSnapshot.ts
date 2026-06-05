import type { AppLocale } from "@/i18n/routing";
import { pickFoodText } from "@/lib/food/dishes";
import type { Dish } from "@/lib/food/types";
import type { SavedFoodRecord, TripFoodRecord } from "@/lib/food/userFoodTypes";

export function dishCity(dish: Dish, locale: AppLocale): string {
  return dish.destinations[0]?.trim() || pickFoodText(dish.name, locale);
}

export function dishToSavedFood(dish: Dish, locale: AppLocale): Omit<SavedFoodRecord, "savedAt"> {
  return {
    id: dish.id,
    name: pickFoodText(dish.name, locale),
    city: dishCity(dish, locale),
    image: dish.image,
    category: dish.category,
    priceRange: dish.budgetTier,
    description: pickFoodText(dish.tagline, locale),
  };
}

export function dishToTripFood(dish: Dish, locale: AppLocale): Omit<TripFoodRecord, "addedAt"> {
  return {
    id: dish.id,
    name: pickFoodText(dish.name, locale),
    city: dishCity(dish, locale),
    image: dish.image,
  };
}

/** Google Maps search — food name + city, opens in a new tab (no auth). */
export function buildFoodMapsUrl(dish: Dish, locale: AppLocale): string {
  const name = pickFoodText(dish.name, locale);
  const city = dishCity(dish, locale);
  const query = encodeURIComponent(`${name} ${city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
