import { TRAVEL_IMAGE_ROTATION, TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";

export type ProvinceDef = {
  name: string;
  region: string;
  summary: string;
  image: string;
};

const IMAGE_POOL = TRAVEL_IMAGE_ROTATION;

const RAW: [string, string][] = [
  ["Hà Giang", "Bắc Bộ"],
  ["Cao Bằng", "Bắc Bộ"],
  ["Bắc Kạn", "Bắc Bộ"],
  ["Lạng Sơn", "Bắc Bộ"],
  ["Tuyên Quang", "Bắc Bộ"],
  ["Thái Nguyên", "Bắc Bộ"],
  ["Phú Thọ", "Bắc Bộ"],
  ["Bắc Giang", "Bắc Bộ"],
  ["Quảng Ninh", "Bắc Bộ"],
  ["Lào Cai", "Bắc Bộ"],
  ["Yên Bái", "Bắc Bộ"],
  ["Điện Biên", "Bắc Bộ"],
  ["Lai Châu", "Bắc Bộ"],
  ["Sơn La", "Bắc Bộ"],
  ["Hòa Bình", "Bắc Bộ"],
  ["Thanh Hóa", "Bắc Trung Bộ"],
  ["Nghệ An", "Bắc Trung Bộ"],
  ["Hà Tĩnh", "Bắc Trung Bộ"],
  ["Quảng Bình", "Bắc Trung Bộ"],
  ["Quảng Trị", "Bắc Trung Bộ"],
  ["Thừa Thiên Huế", "Bắc Trung Bộ"],
  ["Đà Nẵng", "Nam Trung Bộ"],
  ["Quảng Nam", "Nam Trung Bộ"],
  ["Quảng Ngãi", "Nam Trung Bộ"],
  ["Bình Định", "Nam Trung Bộ"],
  ["Phú Yên", "Nam Trung Bộ"],
  ["Khánh Hòa", "Nam Trung Bộ"],
  ["Ninh Thuận", "Nam Trung Bộ"],
  ["Bình Thuận", "Nam Trung Bộ"],
  ["Kon Tum", "Tây Nguyên"],
  ["Gia Lai", "Tây Nguyên"],
  ["Đắk Lắk", "Tây Nguyên"],
  ["Đắk Nông", "Tây Nguyên"],
  ["Lâm Đồng", "Tây Nguyên"],
  ["TP. Hồ Chí Minh", "Đông Nam Bộ"],
  ["Bình Dương", "Đông Nam Bộ"],
  ["Đồng Nai", "Đông Nam Bộ"],
  ["Bà Rịa – Vũng Tàu", "Đông Nam Bộ"],
  ["Bình Phước", "Đông Nam Bộ"],
  ["Tây Ninh", "Đông Nam Bộ"],
  ["Cần Thơ", "Đồng bằng sông Cửu Long"],
  ["Long An", "Đồng bằng sông Cửu Long"],
  ["Tiền Giang", "Đồng bằng sông Cửu Long"],
  ["Bến Tre", "Đồng bằng sông Cửu Long"],
  ["Trà Vinh", "Đồng bằng sông Cửu Long"],
  ["Vĩnh Long", "Đồng bằng sông Cửu Long"],
  ["Đồng Tháp", "Đồng bằng sông Cửu Long"],
  ["An Giang", "Đồng bằng sông Cửu Long"],
  ["Kiên Giang", "Đồng bằng sông Cửu Long"],
  ["Hậu Giang", "Đồng bằng sông Cửu Long"],
  ["Sóc Trăng", "Đồng bằng sông Cửu Long"],
  ["Bạc Liêu", "Đồng bằng sông Cửu Long"],
  ["Cà Mau", "Đồng bằng sông Cửu Long"],
];

export const VIETNAM_PROVINCES: ProvinceDef[] = RAW.map(([name, region], index) => ({
  name,
  region,
  summary: `Khám phá điểm đến, văn hóa và bài viết du lịch gợi ý tại ${name}.`,
  image:
    name === "Đà Nẵng"
      ? TRAVEL_IMAGE_URLS.tentLake
      : name === "Quảng Nam"
        ? "https://media.vietravel.com/images/Content/du-lich-hoi-an-ve-dem-4.jpg"
        : IMAGE_POOL[index % IMAGE_POOL.length],
}));
