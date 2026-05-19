/**
 * Cấu hình font Google qua `next/font` (tối ưu load, không FOUC).
 *
 * Chức năng:
 * - Xuất `bodyFontClassName` để gắn vào `<body>` trong layout.
 * - Chỉ khởi tạo font ở Server Components (layout); không import file này trong `"use client"` — tránh lệch CSS khi hard reload.
 */
import { Caveat, DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm",
  display: "swap",
  adjustFontFallback: true,
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
  adjustFontFallback: true,
});

/** Chuỗi class gắn <body> — dùng trong app/layout.tsx */
export const bodyFontClassName = [
  dmSans.variable,
  caveat.variable,
  dmSans.className,
  "font-sans antialiased",
].join(" ");
