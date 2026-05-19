import type { AppLocale } from "@/i18n/routing";

/** Canonical region names from `vietnamProvinces.ts` (Vietnamese). */
export const REGION_VI_KEYS = {
  "Thủ đô": "capital",
  "Đông Nam Bộ": "southeast",
  "Đồng bằng sông Hồng": "redRiverDelta",
  "Nam Trung Bộ": "southCentral",
  "Bắc Trung Bộ": "northCentral",
  "Đồng bằng sông Cửu Long": "mekongDelta",
  "Bắc Bộ": "north",
  "Tây Nguyên": "centralHighlands",
} as const;

export type RegionMessageKey = (typeof REGION_VI_KEYS)[keyof typeof REGION_VI_KEYS];

const FALLBACK_EN: Record<RegionMessageKey, string> = {
  capital: "Capital region",
  southeast: "Southeast",
  redRiverDelta: "Red River Delta",
  southCentral: "South Central Coast",
  northCentral: "North Central Coast",
  mekongDelta: "Mekong Delta",
  north: "Northern region",
  centralHighlands: "Central Highlands",
};

const FALLBACK_KO: Record<RegionMessageKey, string> = {
  capital: "수도권",
  southeast: "동남부",
  redRiverDelta: "홍강 삼각주",
  southCentral: "남중부",
  northCentral: "북중부",
  mekongDelta: "메콩 델타",
  north: "북부",
  centralHighlands: "중부 고원",
};

const FALLBACK_VI: Record<RegionMessageKey, string> = {
  capital: "Thủ đô",
  southeast: "Đông Nam Bộ",
  redRiverDelta: "Đồng bằng sông Hồng",
  southCentral: "Nam Trung Bộ",
  northCentral: "Bắc Trung Bộ",
  mekongDelta: "Đồng bằng sông Cửu Long",
  north: "Bắc Bộ",
  centralHighlands: "Tây Nguyên",
};

export function regionKeyForViName(regionVi: string): RegionMessageKey | null {
  return (REGION_VI_KEYS as Record<string, RegionMessageKey>)[regionVi] ?? null;
}

/** Resolve a region label without React (e.g. tests). Prefer `useTranslations("Regions")` in UI. */
export function regionLabelFallback(regionVi: string, locale: AppLocale): string {
  const key = regionKeyForViName(regionVi);
  if (!key) return regionVi;
  const table = locale === "ko" ? FALLBACK_KO : locale === "en" ? FALLBACK_EN : FALLBACK_VI;
  return table[key];
}
