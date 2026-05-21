/**
 * Nội dung tĩnh cho trang Guides — chip danh mục và bài mẫu.
 */
import { TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";
import { GUIDE_CATEGORY_CHIPS, type GuideChipKey } from "@/lib/postCategories";
import type { LocalizedString } from "@/lib/i18n/types";

export type GuideCategory = GuideChipKey;

/** Wrap Vietnamese source text in canonical localized shape */
export function viText(value: string): LocalizedString {
  return { vi: value };
}

export type GuideEntry = {
  id: string;
  source: "mock" | "firestore";
  title: LocalizedString;
  excerpt: LocalizedString;
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
    title: viText("Pù Luông & Thanh Hóa"),
    excerpt: viText("Ruộng bậc thang, bản làng và gợi ý lịch trình 2 ngày."),
    category: "handbook",
    readMinutes: 12,
    dateDisplay: "20/05/2026",
    image: TRAVEL_IMAGE_URLS.terraces,
    href: "/explore",
  },
  {
    id: "g2",
    source: "mock",
    title: viText("Mẹo đặt homestay Hội An"),
    excerpt: viText("So sánh khu phố cổ và biển An Bàng, thời điểm đặt phòng rẻ hơn."),
    category: "hotel",
    readMinutes: 8,
    dateDisplay: "12/05/2026",
    image: TRAVEL_IMAGE_URLS.oldTown,
    href: "/guides",
  },
  {
    id: "g3",
    source: "mock",
    title: viText("Huế trong một ngày"),
    excerpt: viText("Đại Nội, lăng tẩm và đồ ăn dân dã."),
    category: "handbook",
    readMinutes: 10,
    dateDisplay: "02/05/2026",
    image: TRAVEL_IMAGE_URLS.landscape,
    href: "/explore",
  },
  {
    id: "g4",
    source: "mock",
    title: viText("Đi Sapa mùa đông — lưu ý sức khỏe"),
    excerpt: viText("Trang phục, độ cao và cách tránh say xe trên đèo."),
    category: "notes",
    readMinutes: 7,
    dateDisplay: "28/04/2026",
    image: TRAVEL_IMAGE_URLS.mountains,
    href: "/guides",
  },
  {
    id: "g5",
    source: "mock",
    title: viText("Di chuyển Hà Nội — Ninh Bình"),
    excerpt: viText("Tàu, xe khách và thuê xe máy — ưu nhược từng cách."),
    category: "transport",
    readMinutes: 9,
    dateDisplay: "15/04/2026",
    image: TRAVEL_IMAGE_URLS.boats,
    href: "/guides",
  },
];

export { GUIDE_CATEGORY_CHIPS, GUIDE_CATEGORY_CHIPS as CATEGORY_CHIPS, labelForGuideChip as labelForCategory } from "@/lib/postCategories";
