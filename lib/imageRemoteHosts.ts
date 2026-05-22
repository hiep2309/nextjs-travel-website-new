/** Hostnames allowed for `next/image` optimization (keep in sync with `next.config.js`). */
export const NEXT_IMAGE_REMOTE_HOSTS = [
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "cdn.pixabay.com",
  "ui-avatars.com",
  "firebasestorage.googleapis.com",
  "media.vietravel.com",
] as const;

const HOST_SET = new Set<string>(NEXT_IMAGE_REMOTE_HOSTS);

/** True when `next/image` can optimize this src (local path or whitelisted host). */
export function canUseNextImage(src: string): boolean {
  const value = src.trim();
  if (!value) return false;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return HOST_SET.has(url.hostname);
  } catch {
    return false;
  }
}
