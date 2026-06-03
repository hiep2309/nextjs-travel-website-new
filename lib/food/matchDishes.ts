/**
 * AI Food Explorer — local recommendation engine.
 *
 * Deterministic scoring that mimics an AI match: it weighs destination affinity,
 * food-preference overlap, budget fit and base popularity into a 0–100 score and
 * produces human-readable reasons. No network/LLM calls, so it never touches the
 * Gemini quota used by the AI Trip Planner.
 */
import { DISHES } from "@/lib/food/dishes";
import { normalizeVietnameseText } from "@/lib/normalizeVn";
import type {
  BudgetTier,
  Dish,
  FoodPreferences,
  ScoredDish,
} from "@/lib/food/types";

const BUDGET_ORDER: Record<BudgetTier, number> = { budget: 0, mid: 1, premium: 2 };

function destinationMatches(dish: Dish, destination: string): boolean {
  if (!destination.trim()) return false;
  const target = normalizeVietnameseText(destination);
  return dish.destinations.some((d) => {
    const norm = normalizeVietnameseText(d);
    return norm.includes(target) || target.includes(norm);
  });
}

function budgetDelta(dish: Dish, budget: BudgetTier): number {
  return Math.abs(BUDGET_ORDER[dish.budgetTier] - BUDGET_ORDER[budget]);
}

/** Score a single dish against the traveler's preferences (0–100). */
export function scoreDish(dish: Dish, prefs: FoodPreferences): ScoredDish {
  const reasons: ScoredDish["reasons"] = [];

  // Base popularity contributes up to 40 points.
  let score = dish.popularity * 0.4;

  // Destination affinity — strongest signal (up to 30).
  if (destinationMatches(dish, prefs.destination)) {
    score += 30;
    reasons.push({ key: "reasonDestination", value: prefs.destination.trim() });
  }

  // Food-preference overlap (up to 22).
  if (prefs.categories.length > 0 && prefs.categories.includes(dish.category)) {
    score += 22;
    reasons.push({ key: "reasonCategory", value: dish.category });
  } else if (prefs.categories.length === 0) {
    // No filter selected → mild neutral boost so results stay rich.
    score += 6;
  }

  // Budget fit (up to 16, decaying with distance).
  const delta = budgetDelta(dish, prefs.budget);
  const budgetScore = Math.max(0, 16 - delta * 8);
  score += budgetScore;
  if (delta === 0) {
    reasons.push({ key: "reasonBudget", value: prefs.budget });
  }

  // Time-of-day fit — surfaces dishes best eaten at the chosen moment (up to 14).
  if (prefs.mealTime !== "any" && dish.bestTime.includes(prefs.mealTime)) {
    score += 14;
    reasons.push({ key: "reasonMeal", value: prefs.mealTime });
  }

  if (dish.trending) {
    score += 3;
    reasons.push({ key: "reasonTrending" });
  }

  // Clamp to a believable 55–99 AI-score band.
  const normalized = Math.round(Math.min(99, Math.max(55, score)));

  if (reasons.length === 0) {
    reasons.push({ key: "reasonPopular" });
  }

  return { dish, score: normalized, reasons };
}

/** Rank all dishes for the given preferences, best first. */
export function rankDishes(prefs: FoodPreferences): ScoredDish[] {
  return DISHES.map((dish) => scoreDish(dish, prefs)).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.dish.popularity - a.dish.popularity;
  });
}

export function getPopularDishes(limit = 5): Dish[] {
  return [...DISHES].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

export function getTrendingDishes(limit = 4): Dish[] {
  return [...DISHES]
    .filter((d) => d.trending)
    .concat(DISHES.filter((d) => !d.trending))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getDishesByRegion(region: Dish["region"]): Dish[] {
  return DISHES.filter((d) => d.region === region);
}

export function getSeasonalDishes(season: Dish["season"]): Dish[] {
  return DISHES.filter((d) => d.season === season || d.season === "all_year");
}

/** Current season for the northern-hemisphere Vietnam climate. */
export function currentSeason(date = new Date()): Dish["season"] {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}
