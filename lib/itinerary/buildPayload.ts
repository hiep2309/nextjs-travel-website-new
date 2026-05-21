import type { AppLocale } from "@/i18n/routing";
import type { LocalizedString } from "@/lib/i18n/types";
import { resolveItineraryCoverImage } from "@/lib/itinerary/coverImage";
import { buildItineraryTags } from "@/lib/itinerary/tags";
import type { SavedItineraryWrite } from "@/lib/itinerary/types";
import type { PlannerFormData, TripPlan } from "@/lib/planner/types";

function localizedField(locale: AppLocale, value: string): LocalizedString {
  return { [locale]: value };
}

function buildSummary(plan: TripPlan): string {
  const first = plan.days[0];
  if (!first) return plan.trip_title;
  const act = first.activities[0];
  if (act?.description) return act.description.slice(0, 160);
  return first.theme || plan.trip_title;
}

export function buildItineraryPayload(
  userId: string,
  plan: TripPlan,
  form: PlannerFormData,
  locale: AppLocale,
): SavedItineraryWrite {
  const destinationText = plan.destination || form.destination;
  return {
    userId,
    locale,
    destination: localizedField(locale, destinationText),
    title: localizedField(locale, plan.trip_title),
    summary: localizedField(locale, buildSummary(plan)),
    plan,
    form: { ...form, locale },
    travelStyle: form.travelStyle,
    budget: form.budget,
    travelers: form.travelers,
    duration: form.days,
    coverImage: resolveItineraryCoverImage(form.destination, plan.destination),
    tags: buildItineraryTags(plan, form.travelStyle),
    aiGenerated: true,
    status: "planning",
  };
}
