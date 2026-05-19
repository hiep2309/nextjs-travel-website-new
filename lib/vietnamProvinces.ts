/**
 * Danh sách 34 tỉnh/thành sau sắp xếp đơn vị hành chính 2025 — dùng cho ProvinceShowcase, Explore, static routes `/destinations/[slug]`.
 *
 * Mỗi mục có: tên, vùng miền, mô tả ngắn, ảnh — chỉ khi khai báo trong `LOCAL_PROVINCE_IMAGE_BY_NAME` (file trong `public/`); không có thì `image` rỗng (giao diện để trống).
 */
export type ProvinceDef = {
  name: string;
  region: string;
  summary: string;
  /** Đường dẫn ảnh trong `public/` hoặc URL tuyệt đối; `""` = chưa có ảnh. */
  image: string;
};

/**
 * Ảnh trong `public/` (đường dẫn URL từ root site). Chỉ thêm khi đã có file đúng địa điểm — không gán nhầm tỉnh khác.
 */
const LOCAL_PROVINCE_IMAGE_BY_NAME: Record<string, string> = {
  "Hà Nội": "/Hà Nội — Hồ Hoàn Kiếm2.jpg",
  "Hải Phòng": "/Hải Phòng — Vịnh Lan Hạ.jpg",
  "Đà Nẵng": "/Đà Nẵng — Biển Mỹ Khê.jpg",
  "Huế": "/Huế — Đại Nội.jpg",
  "An Giang": "/Phú Yên — Gành Đá Đĩa.jpg",
  "Bắc Ninh": "/Bắc Kạn – Hồ Ba Bể.jpg",
  "Cà Mau": "/Quảng Ninh — Đảo Cô Tô.jpg",
  "Cao Bằng": "/Cao Bằng – Thác Bản Giốc.jpg",
  "Đắk Lắk": "/Sa Pa — Fansipan.jpg",
  "Đồng Nai": "/phong_canh.jpg",
  "Đồng Tháp": "/Hội An — Rừng dừa Bảy Mẫu.jpg",
  "Gia Lai": "/Sa Pa — Fansipan2.jpg",
  "Hà Tĩnh": "/Hà Giang — Cao nguyên đá Đồng Văn.jpg",
  "Hưng Yên": "/Hà Nội — Chùa một cột.jpg",
  "Khánh Hòa": "/Bình Định — Kỳ Co.jpg",
  "Lai Châu": "/Yên Bái — Mù Cang Chải.jpg",
  "Lâm Đồng": "/Phú Yên —.jpg",
  "Lạng Sơn": "/Hà Giang — Đèo Mã Pí Lèng2.jpg",
  "Lào Cai": "/Lào Cai — Thung lũng Mường Hoa.jpg",
  "Nghệ An": "/Nghệ An — Biển Cửa Lò.jpg",
  "Ninh Bình": "/Ninh Bình — Tràng An.jpg",
  "Phú Thọ": "/Yên Bái — lang tu le.jpg",
  "Quảng Ngãi": "/Quảng Ngãi — Đảo Lý Sơn.jpg",
  "Quảng Ninh": "/halong_background.jpg",
  "Quảng Trị": "/Quảng Bình — Phong Nha Kẻ Bàng.jpg",
  "Sơn La": "/Mộc Châu — Đồi chè.jpg",
  "Tây Ninh": "/Quang Binh - Hang Sơn Đoòng.jpg",
  "Thái Nguyên": "/Mộc Châu — Đồi chè3.jpg",
  "Thanh Hóa": "/Thanh Hóa — Biển Sầm Sơn.jpg",
  "Tuyên Quang": "/Tuyên Quang – Hồ Na Hang.png",
  "Vĩnh Long": "/. Ninh Bình — Tam Cốc – Bích Động.jpg",
  "Điện Biên": "/Sa Pa — Fansipan3.jpg",
};

/**
 * 6 thành phố trực thuộc Trung ương + 28 tỉnh (theo nhóm bạn liệt kê).
 */
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
  image: LOCAL_PROVINCE_IMAGE_BY_NAME[name] ?? "",
}));
