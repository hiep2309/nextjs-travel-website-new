/** Chuẩn hóa chuỗi để so khớp tỉnh / tiêu đề (bỏ dấu, thường) */
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
