/**
 * Layout gốc (App Router) — áp dụng cho mọi route.
 *
 * Chức năng:
 * - Đặt ngôn ngữ HTML, metadata mặc định.
 * - Áp dụng font toàn cục và bọc nội dung trong AppShell (điều hướng + footer).
 */
import type { Metadata } from "next";
import "./globals.css";
import { bodyFontClassName } from "./fonts";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Travel",
  description: "Travel UI/UX App for Camping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${bodyFontClassName} flex min-h-screen flex-col`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
