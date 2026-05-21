/** Parse Vietnamese cost strings like "4.660.000 VND" to number (VND). */
export function parseVndCost(raw: string | undefined | null): number {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

export function formatVnd(n: number): string {
  return `${n.toLocaleString("vi-VN")} VND`;
}
