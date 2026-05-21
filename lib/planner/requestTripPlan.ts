import type { AppLocale } from "@/i18n/routing";
import { PlannerError, type PlannerErrorCode } from "@/lib/planner/plannerErrors";
import type { PlannerFormData, TripPlanMeta, TripPlanResult } from "@/lib/planner/types";

export type TripPlanApiResponse = TripPlanResult & {
  error?: string;
  code?: PlannerErrorCode;
};

export async function requestTripPlan(
  form: PlannerFormData,
  locale: AppLocale = "vi",
): Promise<TripPlanResult> {
  const res = await fetch("/api/ai-trip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, locale }),
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    const snippet = raw.replace(/\s+/g, " ").slice(0, 80);
    throw new PlannerError(
      res.ok
        ? "Server returned non-JSON response"
        : `API error (${res.status}): ${snippet || "HTML error page"}`,
      "UNKNOWN",
    );
  }

  let data: TripPlanApiResponse;
  try {
    data = JSON.parse(raw) as TripPlanApiResponse;
  } catch {
    throw new PlannerError("Invalid JSON from API", "UNKNOWN");
  }

  if (!res.ok) {
    throw new PlannerError(data.error || `Request failed (${res.status})`, data.code ?? "UNKNOWN");
  }
  if (!data.plan) {
    throw new PlannerError("AI returned empty itinerary", "INVALID_PLAN");
  }

  return {
    plan: data.plan,
    meta: data.meta ?? ({ source: "ai" } satisfies TripPlanMeta),
  };
}

export { PlannerError, type PlannerErrorCode };
