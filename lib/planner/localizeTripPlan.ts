import type { AppLocale } from "@/i18n/routing";
import { translateTextsClient } from "@/lib/translation/translateTextsClient";
import type { TripPlan } from "@/lib/planner/types";

function addText(texts: string[], value: string | undefined | null) {
  const trimmed = value?.trim();
  if (trimmed) texts.push(trimmed);
}

export function collectTripPlanTexts(plan: TripPlan): string[] {
  const texts: string[] = [];
  addText(texts, plan.trip_title);
  addText(texts, plan.destination);
  for (const day of plan.days) {
    addText(texts, day.theme);
    for (const activity of day.activities) {
      addText(texts, activity.place_name);
      addText(texts, activity.description);
      addText(texts, activity.tips);
    }
  }
  for (const gem of plan.hidden_gems) {
    addText(texts, gem.name);
    addText(texts, gem.description);
  }
  return texts;
}

export function applyTripPlanTranslations(plan: TripPlan, lookup: Map<string, string>): TripPlan {
  const tr = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return value;
    return lookup.get(trimmed) ?? value;
  };

  return {
    ...plan,
    trip_title: tr(plan.trip_title),
    destination: tr(plan.destination),
    days: plan.days.map((day) => ({
      ...day,
      theme: tr(day.theme),
      activities: day.activities.map((activity) => ({
        ...activity,
        place_name: tr(activity.place_name),
        description: tr(activity.description),
        tips: tr(activity.tips),
      })),
    })),
    hidden_gems: plan.hidden_gems.map((gem) => ({
      name: tr(gem.name),
      description: tr(gem.description),
    })),
  };
}

export async function localizeTripPlan(
  plan: TripPlan,
  from: AppLocale,
  to: AppLocale,
): Promise<TripPlan> {
  if (from === to) return plan;

  const texts = collectTripPlanTexts(plan);
  const unique = [...new Set(texts)];
  const translated = await translateTextsClient(unique, to, from);
  const lookup = new Map<string, string>();
  unique.forEach((orig, index) => lookup.set(orig, translated[index] ?? orig));
  return applyTripPlanTranslations(plan, lookup);
}
