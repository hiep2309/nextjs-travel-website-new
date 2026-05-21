import type { TravelStyle } from "@/lib/planner/types";
import type { TripPlan } from "@/lib/planner/types";

const STYLE_TAGS: Record<TravelStyle, string> = {
  Chill: "Relax",
  Adventure: "Adventure",
  Food: "Cuisine",
  Luxury: "Luxury",
  Culture: "Culture",
};

export function buildItineraryTags(plan: TripPlan, travelStyle: TravelStyle): string[] {
  const tags = new Set<string>([STYLE_TAGS[travelStyle]]);
  for (const day of plan.days) {
    for (const act of day.activities) {
      const cat = act.category?.trim().toLowerCase();
      if (cat === "food") tags.add("Cuisine");
      if (cat === "culture" || cat === "sightseeing") tags.add("Culture");
      if (cat === "adventure") tags.add("Adventure");
      if (cat === "relax") tags.add("Relax");
    }
  }
  return Array.from(tags).slice(0, 4);
}
