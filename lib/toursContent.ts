/**
 * Dữ liệu tour mẫu cho trang `/tours` — lọc theo miền và chip chủ đề.
 */
import { TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";

export type TourRegion = "north" | "central" | "south";

export type TourRecord = {
  id: string;
  title: string;
  route: string;
  region: TourRegion;
  days: number;
  nights: number;
  description: string;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  transports: string[];
  image: string;
  featured?: boolean;
};

export const MOCK_TOURS: TourRecord[] = [
  {
    id: "sapa-2n1d",
    title: "Sapa Trekking 2N1Đ",
    route: "Lào Cai → Sapa",
    region: "north",
    days: 2,
    nights: 1,
    description: "Trekking ruộng bậc thang, làng dân tộc, đỉnh Fansipan (tùy lựa chọn).",
    priceLabel: "Từ 2.250.000đ",
    rating: 4.8,
    reviewCount: 128,
    transports: ["Xe limousine", "Cáp treo"],
    image: TRAVEL_IMAGE_URLS.terraces,
    featured: true,
  },
  {
    id: "halong-day",
    title: "Hạ Long trong ngày",
    route: "Hà Nội → Vịnh Hạ Long",
    region: "north",
    days: 1,
    nights: 0,
    description: "Du thuyền ngắn, kayak, hang động — phù hợp thời gian hạn chế.",
    priceLabel: "Từ 1.890.000đ",
    rating: 4.6,
    reviewCount: 340,
    transports: ["Xe", "Du thuyền"],
    image: TRAVEL_IMAGE_URLS.boats,
  },
  {
    id: "hue-3n2d",
    title: "Huế — Cố đô & ẩm thực",
    route: "Đà Nẵng → Huế",
    region: "central",
    days: 3,
    nights: 2,
    description: "Đại Nội, lăng tẩm, ẩm thực royal và dòng sông Hương.",
    priceLabel: "Từ 3.400.000đ",
    rating: 4.9,
    reviewCount: 210,
    transports: ["Xe", "Máy bay"],
    image: TRAVEL_IMAGE_URLS.oldTown,
    featured: true,
  },
  {
    id: "nhatrang-4n3d",
    title: "Nha Trang nghỉ dưỡng",
    route: "TP.HCM → Nha Trang",
    region: "south",
    days: 4,
    nights: 3,
    description: "Biển, đảo, resort và hải sản Khánh Hòa.",
    priceLabel: "Từ 4.990.000đ",
    rating: 4.7,
    reviewCount: 156,
    transports: ["Máy bay", "Xe"],
    image: TRAVEL_IMAGE_URLS.beach,
  },
  {
    id: "pulung-2n1d",
    title: "Pù Luông — Thanh Hóa",
    route: "Thanh Hóa → Pù Luông",
    region: "north",
    days: 2,
    nights: 1,
    description: "Ruộng bậc thang, bản làng và trekking nhẹ.",
    priceLabel: "Từ 2.050.000đ",
    rating: 4.85,
    reviewCount: 92,
    transports: ["Xe"],
    image: TRAVEL_IMAGE_URLS.mountains,
  },
];

export type TourChipKey = "all" | TourRegion | "day" | "long";

export function filterToursByChip(tours: TourRecord[], chip: TourChipKey): TourRecord[] {
  if (chip === "all") return tours;
  if (chip === "day") return tours.filter((t) => t.nights === 0);
  if (chip === "long") return tours.filter((t) => t.days >= 3);
  return tours.filter((t) => t.region === chip);
}
