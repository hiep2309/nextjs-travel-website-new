const DESTINATION_COVERS: { match: RegExp; image: string }[] = [
  { match: /hạ long|ha long|halong/i, image: "/Quảng Ninh — Vịnh Hạ Long.jpg" },
  { match: /hội an|hoi an/i, image: "/Hội An — Phố cổ Hội An.jpg" },
  { match: /đà nẵng|da nang|다낭/i, image: "/Đà Nẵng — Biển Mỹ Khê.jpg" },
  { match: /hà nội|hanoi|하노이/i, image: "/Hà Nội — Hồ Hoàn Kiếm 1.jpg" },
  { match: /sa pa|sapa|사파/i, image: "/Sa Pa — Fansipan.jpg" },
  { match: /huế|hue|후에/i, image: "/Huế — Đại Nội.jpg" },
  { match: /ninh bình|ninh binh/i, image: "/Ninh Bình — Tràng An.jpg" },
  { match: /phú quốc|phu quoc/i, image: "/signup_pic.jpg" },
  { match: /hải phòng|hai phong/i, image: "/Hải Phòng — Vịnh Lan Hạ.jpg" },
  { match: /quảng bình|quang binh|phong nha/i, image: "/Quảng Bình — Phong Nha Kẻ Bàng.jpg" },
];

const DEFAULT_COVER = "/signup_pic.jpg";

export function resolveItineraryCoverImage(destination: string, planDestination?: string): string {
  const haystack = `${destination} ${planDestination ?? ""}`.trim();
  for (const rule of DESTINATION_COVERS) {
    if (rule.match.test(haystack)) return rule.image;
  }
  return DEFAULT_COVER;
}
