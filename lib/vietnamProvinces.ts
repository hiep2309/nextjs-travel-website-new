/**
 * Danh sách 34 tỉnh/thành sau sắp xếp đơn vị hành chính 2025 — dùng cho ProvinceShowcase, Explore, static routes `/destinations/[slug]`.
 *
 * Ảnh: `public/destinations/{Tên tỉnh}.jpg|png|…` — xem `lib/provinceDestinationImages.ts`.
 */
import { getProvinceDestinationImage } from "@/lib/provinceDestinationImages";

export type ProvinceDef = {
  name: string;
  region: string;
  summary: string;
  /** `/destinations/…` hoặc `""` nếu chưa có ảnh. */
  image: string;
};

const RAW: [string, string][] = [
  ["Hà Nội", "Thủ đô"],
  ["Thành phố Hồ Chí Minh", "Đông Nam Bộ"],
  ["Hải Phòng", "Đồng bằng sông Hồng"],
  ["Đà Nẵng", "Nam Trung Bộ"],
  ["Cần Thơ", "Đồng bằng sông Cửu Long"],
  ["Huế", "Bắc Trung Bộ"],
  ["An Giang", "Đồng bằng sông Cửu Long"],
  ["Bắc Ninh", "Bắc Bộ"],
  ["Cà Mau", "Đồng bằng sông Cửu Long"],
  ["Cao Bằng", "Bắc Bộ"],
  ["Đắk Lắk", "Tây Nguyên"],
  ["Đồng Nai", "Đông Nam Bộ"],
  ["Đồng Tháp", "Đồng bằng sông Cửu Long"],
  ["Gia Lai", "Tây Nguyên"],
  ["Hà Tĩnh", "Bắc Trung Bộ"],
  ["Hưng Yên", "Bắc Bộ"],
  ["Khánh Hòa", "Nam Trung Bộ"],
  ["Lai Châu", "Bắc Bộ"],
  ["Lâm Đồng", "Tây Nguyên"],
  ["Lạng Sơn", "Bắc Bộ"],
  ["Lào Cai", "Bắc Bộ"],
  ["Nghệ An", "Bắc Trung Bộ"],
  ["Ninh Bình", "Bắc Bộ"],
  ["Phú Thọ", "Bắc Bộ"],
  ["Quảng Ngãi", "Nam Trung Bộ"],
  ["Quảng Ninh", "Bắc Bộ"],
  ["Quảng Trị", "Bắc Trung Bộ"],
  ["Sơn La", "Bắc Bộ"],
  ["Tây Ninh", "Đông Nam Bộ"],
  ["Thái Nguyên", "Bắc Bộ"],
  ["Thanh Hóa", "Bắc Trung Bộ"],
  ["Tuyên Quang", "Bắc Bộ"],
  ["Vĩnh Long", "Đồng bằng sông Cửu Long"],
  ["Điện Biên", "Bắc Bộ"],
];

export const VIETNAM_PROVINCES: ProvinceDef[] = RAW.map(([name, region]) => ({
  name,
  region,
  summary: `Khám phá điểm đến, văn hóa và bài viết du lịch gợi ý tại ${name}.`,
  image: getProvinceDestinationImage(name),
}));
