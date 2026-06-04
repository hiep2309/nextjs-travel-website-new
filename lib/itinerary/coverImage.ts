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
