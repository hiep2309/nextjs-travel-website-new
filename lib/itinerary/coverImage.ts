import { DEFAULT_COVER_IMAGE } from "@/lib/publicAssets";
import { getProvinceDestinationImage } from "@/lib/provinceDestinationImages";

const DESTINATION_COVERS: { match: RegExp; image: string }[] = [
  { match: /hạ long|ha long|halong|quảng ninh/i, image: getProvinceDestinationImage("Quảng Ninh") },
  { match: /hội an|hoi an/i, image: getProvinceDestinationImage("Đà Nẵng") },
  { match: /đà nẵng|da nang|다낭/i, image: getProvinceDestinationImage("Đà Nẵng") },
  { match: /hà nội|hanoi|하노이/i, image: getProvinceDestinationImage("Hà Nội") },
  { match: /sa pa|sapa|lào cai|lao cai|사파/i, image: getProvinceDestinationImage("Lào Cai") },
  { match: /huế|hue|후에/i, image: getProvinceDestinationImage("Huế") },
  { match: /ninh bình|ninh binh/i, image: getProvinceDestinationImage("Ninh Bình") },
  { match: /phú quốc|phu quoc/i, image: DEFAULT_COVER_IMAGE },
  { match: /hải phòng|hai phong/i, image: getProvinceDestinationImage("Hải Phòng") },
  { match: /quảng bình|quang binh|phong nha/i, image: getProvinceDestinationImage("Quảng Trị") },
  { match: /cần thơ|can tho/i, image: getProvinceDestinationImage("Cần Thơ") },
  { match: /hồ chí minh|ho chi minh|sài gòn|saigon/i, image: getProvinceDestinationImage("Thành phố Hồ Chí Minh") },
];

export function resolveItineraryCoverImage(destination: string, planDestination?: string): string {
  const haystack = `${destination} ${planDestination ?? ""}`.trim();
  for (const rule of DESTINATION_COVERS) {
    if (rule.match.test(haystack) && rule.image) return rule.image;
  }
  return DEFAULT_COVER_IMAGE;
}

const STABLE_COVER_PREFIXES = ["/destinations/", "/heroes/", "/icons/", "/foods/"] as const;

/** Paths under reorganized `public/` folders — safe to persist long-term. */
export function isStableItineraryCoverPath(src: string): boolean {
  const value = src.trim();
  if (!value || !value.startsWith("/")) return false;
  return STABLE_COVER_PREFIXES.some((prefix) => value.startsWith(prefix));
}

/**
 * Use stored cover when still valid; otherwise re-resolve from destination.
 * Fixes legacy records that still point at deleted root-level files
 * (e.g. `/Đà Nẵng — Biển Mỹ Khê.jpg` → `/destinations/Đà Nẵng.jpg`).
 */
export function getEffectiveItineraryCover(
  storedCover: string,
  destination: string,
  planDestination?: string,
): string {
  const trimmed = storedCover.trim();
  if (trimmed && isStableItineraryCoverPath(trimmed)) return trimmed;

  const resolved = resolveItineraryCoverImage(destination, planDestination);
  return resolved.trim() || DEFAULT_COVER_IMAGE;
}
