"use client";

import { useLocale, useTranslations } from "next-intl";
import { regionKeyForViName, regionLabelFallback } from "@/lib/regionLabels";
import type { AppLocale } from "@/i18n/routing";

/** Localized label for a canonical Vietnamese region name from province data. */
export function useRegionLabel(regionVi: string): string {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Regions");
  const key = regionKeyForViName(regionVi);
  if (!key) return regionVi;
  const label = t(key as Parameters<typeof t>[0]);
  if (label === key) return regionLabelFallback(regionVi, locale);
  return label;
}
