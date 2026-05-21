"use client";

import { useTranslations } from "next-intl";
import { isPlannerCategoryKey } from "@/lib/planner/i18n";

/** Map AI category slug (or legacy free text) to localized AiPlanner label. */
export function usePlannerCategoryLabel(category: string): string {
  const t = useTranslations("AiPlanner");
  const key = category.trim().toLowerCase();
  if (isPlannerCategoryKey(key)) {
    return t(`cat_${key}`);
  }
  return category;
}
