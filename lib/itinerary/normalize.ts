import type { DocumentData, Timestamp } from "firebase/firestore";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getEffectiveItineraryCover } from "@/lib/itinerary/coverImage";
import { getTranslation } from "@/lib/getTranslation";
import type { SavedItineraryRecord } from "@/lib/itinerary/types";

function toDate(value: unknown): Date {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate();
  }
  if (typeof value === "number") return new Date(value);
  return new Date();
}

function asLocale(raw: unknown): AppLocale {
  const s = String(raw ?? "vi");
  return routing.locales.includes(s as AppLocale) ? (s as AppLocale) : "vi";
}

export function normalizeSavedItinerary(id: string, data: DocumentData): SavedItineraryRecord | null {
  if (!data.userId || !data.plan || !data.form) return null;

  const form = data.form as SavedItineraryRecord["form"];
  const plan = data.plan as SavedItineraryRecord["plan"];

  return {
    id,
    userId: String(data.userId),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt ?? data.createdAt),
    locale: asLocale(data.locale),
    destination: (data.destination as SavedItineraryRecord["destination"]) ?? {},
    title: (data.title as SavedItineraryRecord["title"]) ?? {},
    summary: (data.summary as SavedItineraryRecord["summary"]) ?? {},
    plan,
    form,
    travelStyle: data.travelStyle as SavedItineraryRecord["travelStyle"],
    budget: String(data.budget ?? ""),
    travelers: Number(data.travelers) || 1,
    duration: Number(data.duration) || 1,
    coverImage: getEffectiveItineraryCover(
      String(data.coverImage ?? ""),
      form.destination ||
        plan.destination ||
        getTranslation(
          (data.destination as SavedItineraryRecord["destination"]) ?? {},
          asLocale(data.locale),
        ),
      plan.destination,
    ),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    aiGenerated: data.aiGenerated !== false,
    status: (data.status as SavedItineraryRecord["status"]) ?? "planning",
  };
}
