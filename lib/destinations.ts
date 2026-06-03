/**
 * Shared Vietnam destination options for selectors (AI Food Explorer, AI Trip Planner…).
 * Iconic travel/food cities first, then all provinces (A–Z), de-duplicated.
 */
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";

/** Iconic cities surfaced first; some aren't standalone provinces post-2025 merge. */
const ICONIC_CITIES = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế", "Hội An", "Nha Trang", "Cần Thơ"];

const PROVINCE_NAMES = VIETNAM_PROVINCES.map((p) =>
  p.name === "Thành phố Hồ Chí Minh" ? "Hồ Chí Minh" : p.name,
);

export const DESTINATION_OPTIONS: string[] = Array.from(
  new Set([
    ...ICONIC_CITIES,
    ...PROVINCE_NAMES.filter((n) => !ICONIC_CITIES.includes(n)).sort((a, b) =>
      a.localeCompare(b, "vi"),
    ),
  ]),
);
