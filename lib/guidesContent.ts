/**
 * Nội dung tĩnh cho trang Guides — chip danh mục và danh sách bài mẫu (`MOCK_GUIDES`).
 *
 * Bài từ Firestore được map sang `GuideEntry` trong `app/guides/page.tsx`.
 */
import { TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";

export type GuideCategory = "all" | "dest" | "food" | "culture" | "tips";

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
    title: "Mùa vàng Mù Cang Chải",
    excerpt: "Thời điểm đẹp nhất và lộ trình gợi ý trong 2–3 ngày.",
    category: "dest",
    readMinutes: 12,
    dateDisplay: "20/05/2026",
    image: TRAVEL_IMAGE_URLS.terraces,
    href: "/explore",
  },
  {
    id: "g2",
    source: "mock",
    title: "Ăn uống Hội An",
    excerpt: "Quán vỉa hè, cao lầu, và cách tránh đông vào tối cuối tuần.",
    category: "food",
    readMinutes: 8,
    dateDisplay: "12/05/2026",
    image: TRAVEL_IMAGE_URLS.oldTown,
    href: "/explore",
  },
  {
    id: "g3",
    source: "mock",
    title: "Huế trong một ngày",
    excerpt: "Đại Nội, lăng tẩm và đồ ăn dân dã.",
    category: "dest",
    readMinutes: 10,
    dateDisplay: "02/05/2026",
    image: TRAVEL_IMAGE_URLS.landscape,
    href: "/explore",
  },
];

export const CATEGORY_CHIPS: { key: GuideCategory; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "dest", label: "Điểm đến" },
  { key: "food", label: "Ẩm thực" },
  { key: "culture", label: "Văn hóa" },
  { key: "tips", label: "Mẹo đi đường" },
];

export function labelForCategory(c: GuideCategory): string {
  const f = CATEGORY_CHIPS.find((x) => x.key === c);
  return f?.label ?? c;
}
