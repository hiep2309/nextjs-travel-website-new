"use client";

import { useTranslations } from "next-intl";

/** Canonical values stored in Firestore (Vietnamese labels). */
export const TRAVEL_TIME_VALUES = [
  "Trong ngày",
  "1–3 ngày",
  "4–7 ngày",
  "1–2 tuần",
  "Trên 2 tuần",
] as const;

const KEYS = ["d1", "d2", "d3", "d4", "d5"] as const;

export function useTravelTimeLabels() {
  const t = useTranslations("TravelTimes");
  return TRAVEL_TIME_VALUES.map((value, i) => ({
    value,
    label: t(KEYS[i]),
  }));
}
