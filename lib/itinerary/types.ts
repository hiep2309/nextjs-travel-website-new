import type { AppLocale } from "@/i18n/routing";
import type { LocalizedString } from "@/lib/i18n/types";
import type { PlannerFormData, TripPlan, TravelStyle } from "@/lib/planner/types";

export type ItineraryStatus = "draft" | "planning" | "completed";

export type SavedItineraryRecord = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  locale: AppLocale;
  destination: LocalizedString;
  title: LocalizedString;
  summary: LocalizedString;
  plan: TripPlan;
  form: PlannerFormData;
  travelStyle: TravelStyle;
  budget: string;
  travelers: number;
  duration: number;
  coverImage: string;
  tags: string[];
  aiGenerated: boolean;
  status: ItineraryStatus;
};

export type SavedItineraryWrite = Omit<SavedItineraryRecord, "id" | "createdAt" | "updatedAt">;

export type ItinerarySort = "newest" | "oldest" | "durationAsc" | "durationDesc";
