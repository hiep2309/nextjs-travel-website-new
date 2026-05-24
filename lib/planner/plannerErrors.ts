import { ExtractJsonError } from "@/lib/extractJson";
import { isQuotaError } from "@/lib/planner/quota";
import { TripPlanValidationError } from "@/lib/planner/validateTripPlan";

/** API / client error codes for the AI trip planner. */
export type PlannerErrorCode =
  | "PARSE_FAILED"
  | "INVALID_PLAN"
  | "TRUNCATED"
  | "QUOTA"
  | "API_KEY"
  | "BLOCKED"
  | "EMPTY"
  | "UNAUTHORIZED"
  | "DAILY_LIMIT"
  | "UNKNOWN";

export class PlannerError extends Error {
  readonly code: PlannerErrorCode;

  constructor(message: string, code: PlannerErrorCode) {
    super(message);
    this.name = "PlannerError";
    this.code = code;
  }
}

export function mapPlannerError(err: unknown): PlannerError {
  if (err instanceof PlannerError) return err;

  if (err instanceof ExtractJsonError) {
    if (err.code === "TRUNCATED") {
      return new PlannerError(err.message, "TRUNCATED");
    }
    if (err.code === "EMPTY") {
      return new PlannerError(err.message, "EMPTY");
    }
    return new PlannerError(
      "AI could not generate a valid itinerary. Please try again.",
      "PARSE_FAILED",
    );
  }

  if (err instanceof TripPlanValidationError) {
    return new PlannerError(
      "AI returned an incomplete itinerary. Please try again.",
      "INVALID_PLAN",
    );
  }

  const msg = err instanceof Error ? err.message : String(err);

  if (/GEMINI_API_KEY/i.test(msg)) {
    return new PlannerError(msg, "API_KEY");
  }
  if (isQuotaError(err) || /quota|rate limit|429|RESOURCE_EXHAUSTED/i.test(msg)) {
    return new PlannerError(
      "AI is currently busy. Please try again shortly.",
      "QUOTA",
    );
  }
  if (/blocked|safety/i.test(msg)) {
    return new PlannerError(msg, "BLOCKED");
  }
  if (/truncated|malformed JSON|valid JSON|valid itinerary/i.test(msg)) {
    return new PlannerError(
      "AI could not generate a valid itinerary. Please try again.",
      "PARSE_FAILED",
    );
  }
  if (/incomplete itinerary/i.test(msg)) {
    return new PlannerError(
      "AI returned an incomplete itinerary. Please try again.",
      "INVALID_PLAN",
    );
  }

  return new PlannerError(msg || "Failed to generate itinerary", "UNKNOWN");
}
