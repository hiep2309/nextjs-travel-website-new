"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedProvinceFields } from "@/lib/content/localizedProvince";
import {
  buildDestinationPageModel,
  type DestinationPageModel,
} from "@/lib/destinationPageModel";
import type { ProvinceDef } from "@/lib/vietnamProvinces";

type DestCopyFn = (key: string, values?: Record<string, string | number>) => string;

export function buildDestinationModelForProvince(
  province: ProvinceDef,
  locale: AppLocale,
  t: DestCopyFn,
): DestinationPageModel {
  const localized = buildLocalizedProvinceFields(province, locale);
  return buildDestinationPageModel(province, locale, t, localized);
}

export function useDestinationPageModel(province: ProvinceDef): DestinationPageModel {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Destinations");
  return useMemo(
    () => buildDestinationModelForProvince(province, locale, t),
    [province, locale, t],
  );
}
