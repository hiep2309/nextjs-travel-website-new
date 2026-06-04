/**
 * Ảnh tỉnh/thành trong `public/destinations/` — tên file trùng tên tỉnh (2025).
 * Cập nhật bảng này khi thêm/xóa file trong thư mục.
 */
import { destImage } from "@/lib/publicAssets";

/** Tên tỉnh (tiếng Việt) → tên file trong `public/destinations/`. */
export const PROVINCE_DESTINATION_FILE: Record<string, string> = {
  "Hà Nội": "Hà Nội.png",
  "Thành phố Hồ Chí Minh": "Thành phố Hồ Chí Minh.jpg",
  "Hải Phòng": "Hải Phòng.jpg",
  "Đà Nẵng": "Đà Nẵng.jpg",
  "Cần Thơ": "Cần Thơ.jpg",
  "Huế": "Huế.jpg",
  "An Giang": "An Giang.jpg",
  "Bắc Ninh": "Bắc Ninh.jpg",
  "Cà Mau": "Cà Mau.jpg",
  "Cao Bằng": "Cao Bằng.jpg",
  "Đắk Lắk": "Đắk Lắk.webp",
  "Đồng Nai": "Đồng Nai.jpg",
  "Đồng Tháp": "Đồng Tháp.jpg",
  "Gia Lai": "Gia Lai.jpg",
  "Hà Tĩnh": "Hà Tĩnh.jpg",
  "Hưng Yên": "Hưng Yên.jpg",
  "Khánh Hòa": "Khánh Hòa.jpeg",
  "Lai Châu": "Lai Châu.jpg",
  "Lâm Đồng": "Lâm Đồng.jpeg",
  "Lạng Sơn": "Lạng Sơn.jpg",
  "Lào Cai": "Lào Cai.jpg",
  "Nghệ An": "Nghệ An.jpg",
  "Ninh Bình": "Ninh Bình.jpg",
  "Phú Thọ": "Phú Thọ.jpg",
  "Quảng Ngãi": "Quảng Ngãi.jpg",
  "Quảng Ninh": "Quảng Ninh.jpg",
  "Quảng Trị": "Quảng Trị.jpg",
  "Sơn La": "Sơn La.jpg",
  "Tây Ninh": "Tây Ninh.jpg",
  "Thái Nguyên": "Thái Nguyên.jpg",
  "Thanh Hóa": "Thanh Hóa.jpg",
  "Tuyên Quang": "Tuyên Quang.png",
  "Vĩnh Long": "Vĩnh Long.jpg",
  "Điện Biên": "Điện Biên.webp",
};

export function getProvinceDestinationImage(provinceName: string): string {
  const file = PROVINCE_DESTINATION_FILE[provinceName];
  return file ? destImage(file) : "";
}
