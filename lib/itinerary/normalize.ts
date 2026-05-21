import type { DocumentData, Timestamp } from "firebase/firestore";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
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

  return {
    id,
    userId: String(data.userId),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt ?? data.createdAt),
    locale: asLocale(data.locale),
    destination: (data.destination as SavedItineraryRecord["destination"]) ?? {},
    title: (data.title as SavedItineraryRecord["title"]) ?? {},
    summary: (data.summary as SavedItineraryRecord["summary"]) ?? {},
    plan: data.plan as SavedItineraryRecord["plan"],
    form: data.form as SavedItineraryRecord["form"],
    travelStyle: data.travelStyle as SavedItineraryRecord["travelStyle"],
    budget: String(data.budget ?? ""),
    travelers: Number(data.travelers) || 1,
    duration: Number(data.duration) || 1,
    coverImage: String(data.coverImage ?? "/signup_pic.jpg"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    aiGenerated: data.aiGenerated !== false,
    status: (data.status as SavedItineraryRecord["status"]) ?? "planning",
  };
}
