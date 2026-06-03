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
    title: {
      vi: "Pù Luông & Thanh Hóa",
      en: "Pu Luong & Thanh Hoa",
      ko: "푸루옹 & 타인호아",
    },
    excerpt: {
      vi: "Ruộng bậc thang, bản làng và gợi ý lịch trình 2 ngày.",
      en: "Rice terraces, ethnic villages and a suggested 2-day itinerary.",
      ko: "계단식 논, 소수민족 마을과 추천 2일 일정.",
    },
    category: "handbook",
    readMinutes: 12,
    dateDisplay: "20/05/2026",
    image: TRAVEL_IMAGE_URLS.terraces,
    href: "/explore",
  },
  {
    id: "g2",
    source: "mock",
    title: {
      vi: "Mẹo đặt homestay Hội An",
      en: "Tips for booking Hoi An homestays",
      ko: "호이안 홈스테이 예약 팁",
    },
    excerpt: {
      vi: "So sánh khu phố cổ và biển An Bàng, thời điểm đặt phòng rẻ hơn.",
      en: "Old town vs An Bang beach, and when rooms are cheaper.",
      ko: "구시가지와 안방 해변 비교, 저렴하게 예약하는 시기.",
    },
    category: "hotel",
    readMinutes: 8,
    dateDisplay: "12/05/2026",
    image: TRAVEL_IMAGE_URLS.oldTown,
    href: "/guides",
  },
  {
    id: "g3",
    source: "mock",
    title: {
      vi: "Huế trong một ngày",
      en: "Hue in one day",
      ko: "후에 1일 코스",
    },
    excerpt: {
      vi: "Đại Nội, lăng tẩm và đồ ăn dân dã.",
      en: "The Imperial City, royal tombs and humble local food.",
      ko: "황성, 왕릉과 소박한 현지 음식.",
    },
    category: "handbook",
    readMinutes: 10,
    dateDisplay: "02/05/2026",
    image: TRAVEL_IMAGE_URLS.landscape,
    href: "/explore",
  },
  {
    id: "g4",
    source: "mock",
    title: {
      vi: "Đi Sapa mùa đông — lưu ý sức khỏe",
      en: "Sapa in winter — health notes",
      ko: "겨울 사파 — 건강 주의사항",
    },
    excerpt: {
      vi: "Trang phục, độ cao và cách tránh say xe trên đèo.",
      en: "Clothing, altitude and avoiding motion sickness on mountain passes.",
      ko: "복장, 고도와 산길 멀미 예방법.",
    },
    category: "notes",
    readMinutes: 7,
    dateDisplay: "28/04/2026",
    image: TRAVEL_IMAGE_URLS.mountains,
    href: "/guides",
  },
  {
    id: "g5",
    source: "mock",
    title: {
      vi: "Di chuyển Hà Nội — Ninh Bình",
      en: "Getting from Hanoi to Ninh Binh",
      ko: "하노이–닌빈 이동",
    },
    excerpt: {
      vi: "Tàu, xe khách và thuê xe máy — ưu nhược từng cách.",
      en: "Train, coach and motorbike rental — the pros and cons of each.",
      ko: "기차, 시외버스, 오토바이 렌탈 — 각 방법의 장단점.",
    },
    category: "transport",
    readMinutes: 9,
    dateDisplay: "15/04/2026",
    image: TRAVEL_IMAGE_URLS.boats,
    href: "/guides",
  },
];

export { GUIDE_CATEGORY_CHIPS, GUIDE_CATEGORY_CHIPS as CATEGORY_CHIPS, labelForGuideChip as labelForCategory } from "@/lib/postCategories";
