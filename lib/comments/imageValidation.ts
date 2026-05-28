import { looksLikeImageUrl, parseImageUrl } from "@/lib/parseImageUrl";

/** Accept Firebase Storage, common CDNs, or paths ending in image extensions. */
export function isAllowedCommentImageUrl(raw: string): boolean {
  const parsed = parseImageUrl(raw);
  if (!parsed) return false;
  return looksLikeImageUrl(parsed);
}

export function normalizeCommentImageUrl(raw: string): string | null {
  const parsed = parseImageUrl(raw);
  if (!parsed || !isAllowedCommentImageUrl(parsed)) return null;
  return parsed;
}
