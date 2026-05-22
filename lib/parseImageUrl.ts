/** Parse http(s) image URL for post gallery and inline editor inserts. */
export function parseImageUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

const IMAGE_PATH = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

/** Heuristic for paste: only auto-insert when URL likely points to an image file. */
export function looksLikeImageUrl(raw: string): boolean {
  const parsed = parseImageUrl(raw);
  if (!parsed) return false;
  try {
    const url = new URL(parsed);
    if (IMAGE_PATH.test(url.pathname)) return true;
    if (/firebasestorage\.googleapis\.com$/i.test(url.hostname)) return true;
    if (/\.googleusercontent\.com$/i.test(url.hostname)) return true;
    if (/i\.imgur\.com$/i.test(url.hostname)) return true;
    if (/images\.unsplash\.com|cdn\.pixabay\.com|media\.vietravel\.com$/i.test(url.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}
