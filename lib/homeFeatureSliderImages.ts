/**
 * Carousel "Why choose us" — ảnh từ `public/destinations/`.
 */
import { getProvinceDestinationImage } from "@/lib/provinceDestinationImages";

export const FEATURE_SLIDER_IMAGE_POOL: string[] = [
  getProvinceDestinationImage("Quảng Ninh"),
  getProvinceDestinationImage("Ninh Bình"),
  getProvinceDestinationImage("Đà Nẵng"),
  getProvinceDestinationImage("Huế"),
  getProvinceDestinationImage("Hà Nội"),
  getProvinceDestinationImage("Hải Phòng"),
  getProvinceDestinationImage("Cao Bằng"),
  getProvinceDestinationImage("Lào Cai"),
  getProvinceDestinationImage("Thanh Hóa"),
].filter(Boolean);
