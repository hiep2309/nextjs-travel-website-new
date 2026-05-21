import type { AppLocale } from "@/i18n/routing";
import type { PlannerFormData, TripPlan } from "@/lib/planner/types";

export type TripPlanApiResponse = {
  plan?: TripPlan;
  error?: string;
};

export async function requestTripPlan(
  form: PlannerFormData,
  locale: AppLocale = "vi",
): Promise<TripPlan> {
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
    throw new Error(
      res.ok
        ? "Server returned non-JSON response"
        : `API error (${res.status}): ${snippet || "HTML error page — restart dev server and check /api/ai-trip"}`,
    );
  }

  let data: TripPlanApiResponse;
  try {
    data = JSON.parse(raw) as TripPlanApiResponse;
  } catch {
    throw new Error("Invalid JSON from API");
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  if (!data.plan) {
    throw new Error("AI returned empty itinerary");
  }

  return data.plan;
}
