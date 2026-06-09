/**
 * Map province / city names (Food Explorer destination) → culinary region.
 */
import type { FoodRegion } from "@/lib/food/types";
import { normalizeVietnameseText } from "@/lib/normalizeVn";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";

const NORTH_REGIONS = new Set(["Bắc Bộ", "Đồng bằng sông Hồng", "Thủ đô"]);
const CENTRAL_REGIONS = new Set(["Bắc Trung Bộ", "Nam Trung Bộ"]);
const SOUTH_REGIONS = new Set(["Đông Nam Bộ", "Tây Nguyên", "Đồng bằng sông Cửu Long"]);

function displayProvinceName(name: string): string {
  return name === "Thành phố Hồ Chí Minh" ? "Hồ Chí Minh" : name;
}

export function resolveProvinceName(destination: string): string | null {
  const target = normalizeVietnameseText(destination.trim());
  if (!target) return null;

  for (const p of VIETNAM_PROVINCES) {
    const display = displayProvinceName(p.name);
    const norm = normalizeVietnameseText(display);
    if (norm === target || norm.includes(target) || target.includes(norm)) {
      return p.name;
    }
  }

  return null;
}

export function destinationToFoodRegion(destination: string): FoodRegion | null {
  const trimmed = destination.trim();
  if (!trimmed) return null;

  const provinceName = resolveProvinceName(trimmed);
  if (provinceName) {
    const p = VIETNAM_PROVINCES.find((x) => x.name === provinceName);
    if (!p) return null;
    if (NORTH_REGIONS.has(p.region)) return "north";
    if (CENTRAL_REGIONS.has(p.region)) return "central";
    if (SOUTH_REGIONS.has(p.region)) return "south";
    return null;
  }

  const t = normalizeVietnameseText(trimmed);
  if (t.includes("hoi an") || t.includes("hue") || t.includes("da nang")) return "central";
  if (t.includes("nha trang") || t.includes("saigon") || t.includes("ho chi minh")) return "south";
  if (t.includes("hanoi") || t.includes("ha noi")) return "north";

  return null;
}
