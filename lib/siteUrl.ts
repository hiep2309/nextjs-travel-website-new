/**
 * URL gốc site — dùng cho metadata, sitemap, Open Graph (dev: localhost; production: đặt NEXT_PUBLIC_SITE_URL).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path.startsWith("http")) return path;
  const rel = path.startsWith("/") ? path : `/${path}`;
  return base + encodeURI(rel);
}
