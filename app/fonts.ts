import { Bebas_Neue, Caveat, DM_Sans } from "next/font/google";

/**
 * Mọi `next/font` chỉ khởi tạo ở đây và import từ Server Components (layout).
 * Không gọi `next/font` trong file `"use client"` — dễ lệch inject CSS khi hard reload.
 */
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
  adjustFontFallback: true,
});

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
  bebas.variable,
  dmSans.variable,
  caveat.variable,
  dmSans.className,
  "font-sans antialiased",
].join(" ");
