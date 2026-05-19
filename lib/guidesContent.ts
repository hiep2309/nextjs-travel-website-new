/**
 * Nội dung tĩnh cho trang Guides — chip danh mục và bài mẫu.
 *
 * Bài Firestore được map trong `app/guides/page.tsx` theo `postType` (guide_*).
 */
import { TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";
import { GUIDE_CATEGORY_CHIPS, type GuideChipKey } from "@/lib/postCategories";

export type GuideCategory = GuideChipKey;

export type GuideEntry = {
  id: string;
  source: "mock" | "firestore";
  title: string;
  excerpt: string;
  category: GuideCategory;
  readMinutes: number;
  dateDisplay: string;
  image: string;
  href: string;
  viewCount?: number;
};

export const MOCK_GUIDES: GuideEntry[] = [
  {
    id: "g1",
    source: "mock",
    title: "Pù Luông & Thanh Hóa",
    excerpt: "Ruộng bậc thang, bản làng và gợi ý lịch trình 2 ngày.",
    category: "handbook",
    readMinutes: 12,
    dateDisplay: "20/05/2026",
    image: TRAVEL_IMAGE_URLS.terraces,
    href: "/explore",
  },
  {
    id: "g2",
    source: "mock",
    title: "Mẹo đặt homestay Hội An",
    excerpt: "So sánh khu phố cổ và biển An Bàng, thời điểm đặt phòng rẻ hơn.",
    category: "hotel",
    readMinutes: 8,
    dateDisplay: "12/05/2026",
    image: TRAVEL_IMAGE_URLS.oldTown,
    href: "/guides",
  },
  {
    id: "g3",
    source: "mock",
    title: "Huế trong một ngày",
    excerpt: "Đại Nội, lăng tẩm và đồ ăn dân dã.",
    category: "handbook",
    readMinutes: 10,
    dateDisplay: "02/05/2026",
    image: TRAVEL_IMAGE_URLS.landscape,
    href: "/explore",
  },
  {
    id: "g4",
    source: "mock",
    title: "Đi Sapa mùa đông — lưu ý sức khỏe",
    excerpt: "Trang phục, độ cao và cách tránh say xe trên đèo.",
    category: "notes",
    readMinutes: 7,
    dateDisplay: "28/04/2026",
    image: TRAVEL_IMAGE_URLS.mountains,
    href: "/guides",
  },
  {
    id: "g5",
    source: "mock",
    title: "Di chuyển Hà Nội — Ninh Bình",
    excerpt: "Tàu, xe khách và thuê xe máy — ưu nhược từng cách.",
    category: "transport",
    readMinutes: 9,
    dateDisplay: "15/04/2026",
    image: TRAVEL_IMAGE_URLS.boats,
    href: "/guides",
  },
];

export const CATEGORY_CHIPS = GUIDE_CATEGORY_CHIPS;

export function labelForCategory(c: GuideCategory): string {
  const f = CATEGORY_CHIPS.find((x) => x.key === c);
  return f?.label ?? c;
}
