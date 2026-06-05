import type { TripPlan } from "@/lib/planner/types";

export type TripPlanValidationCode = "INVALID_PLAN" | "MISSING_TITLE" | "MISSING_DAYS" | "MISSING_ACTIVITIES";

export class TripPlanValidationError extends Error {
  readonly code: TripPlanValidationCode;

  constructor(message: string, code: TripPlanValidationCode) {
    super(message);
    this.name = "TripPlanValidationError";
    this.code = code;
  }
}

/** Validate parsed AI output before returning to the client. */
export function validateTripPlan(data: unknown): TripPlan {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TripPlanValidationError("Invalid itinerary structure", "INVALID_PLAN");
  }

  const plan = data as TripPlan;

  if (typeof plan.trip_title !== "string" || !plan.trip_title.trim()) {
    throw new TripPlanValidationError("Itinerary is missing trip_title", "MISSING_TITLE");
  }

  if (!Array.isArray(plan.days) || plan.days.length === 0) {
    throw new TripPlanValidationError("Itinerary is missing days", "MISSING_DAYS");
  }

  for (const day of plan.days) {
    if (!day || typeof day !== "object") {
      throw new TripPlanValidationError("Invalid day entry in itinerary", "INVALID_PLAN");
    }
    if (!Array.isArray(day.activities) || day.activities.length === 0) {
      throw new TripPlanValidationError("Each day must include activities", "MISSING_ACTIVITIES");
    }
  }

  const localFood = (plan as TripPlan & { local_food?: unknown }).local_food;
  if (localFood !== undefined) {
    if (!Array.isArray(localFood) || !localFood.every((x) => typeof x === "string")) {
      throw new TripPlanValidationError("local_food must be string[]", "INVALID_PLAN");
    }
    return { ...plan, local_food: localFood.map((s) => String(s).trim()).filter(Boolean) };
  }

  return plan;
}
