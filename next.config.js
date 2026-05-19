/**
 * Cấu hình Next.js — next-intl plugin + whitelist ảnh remote (`next/image`).
 *
 * @type {import('next').NextConfig}
 */
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  /** Giảm kích thước bundle khi import nhiều icon từ lucide-react */
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    domains: [
      "images.unsplash.com",
      "lh3.googleusercontent.com",
      "cdn.pixabay.com",
      "ui-avatars.com",
      "firebasestorage.googleapis.com",
      "media.vietravel.com",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.pixabay.com", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "media.vietravel.com", pathname: "/**" },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
