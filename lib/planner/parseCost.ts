import type { AppLocale } from "@/i18n/routing";

/** Parse cost strings like "4.660.000 VND" or "4,660,000 VND" to number (VND). */
export function parseVndCost(raw: string | undefined | null): number {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

export function formatVnd(n: number, locale: AppLocale = "vi"): string {
  const tag = locale === "ko" ? "ko-KR" : locale === "en" ? "en-US" : "vi-VN";
  return `${n.toLocaleString(tag)} VND`;
}
