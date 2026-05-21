"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import type { ProvinceDef } from "@/lib/vietnamProvinces";
import {
  buildLocalizedProvinceFields,
  getLocalizedProvinceName,
  type LocalizedProvinceView,
} from "@/lib/content/localizedProvince";

/** Resolve province catalog fields for the active UI locale. */
export function useLocalizedProvince(province: ProvinceDef): LocalizedProvinceView {
  const locale = useLocale() as AppLocale;
  return useMemo(() => buildLocalizedProvinceFields(province, locale), [province, locale]);
}

export function useLocalizedProvinceName(viName: string): string {
  const locale = useLocale() as AppLocale;
  return useMemo(() => getLocalizedProvinceName(viName, locale), [viName, locale]);
}
