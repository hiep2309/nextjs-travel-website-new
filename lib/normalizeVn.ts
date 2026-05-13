/**
 * Chuẩn hóa tiếng Việt để so khớp chuỗi (bỏ dấu, chữ thường).
 *
 * Dùng cho lọc tỉnh trên Explore, build slug, tìm kiếm không phân biệt dấu.
 */
export function normalizeVietnameseText(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
