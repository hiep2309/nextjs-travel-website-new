import { normalizeVietnameseText } from "@/lib/normalizeVn";
import { VIETNAM_PROVINCES, type ProvinceDef } from "@/lib/vietnamProvinces";

/** Slug URL ổn định cho mọi tỉnh (không dấu, chữ thường, nối bằng -) */
export function provinceNameToSlug(name: string): string {
  return normalizeVietnameseText(name)
    .replace(/\./g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getProvinceBySlug(slug: string): ProvinceDef | undefined {
  return VIETNAM_PROVINCES.find((p) => provinceNameToSlug(p.name) === slug);
}
