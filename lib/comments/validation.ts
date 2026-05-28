import {
  MAX_COMMENT_IMAGES,
  MAX_COMMENT_LENGTH,
  MAX_REPORT_REASON_LENGTH,
} from "@/lib/comments/constants";
import { isAllowedCommentImageUrl, normalizeCommentImageUrl } from "@/lib/comments/imageValidation";

export function sanitizeCommentContent(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function normalizeCommentImages(urls: string[]): string[] {
  const out: string[] = [];
  for (const raw of urls) {
    const parsed = normalizeCommentImageUrl(raw);
    if (!parsed) continue;
    if (out.includes(parsed)) continue;
    out.push(parsed);
    if (out.length >= MAX_COMMENT_IMAGES) break;
  }
  return out;
}

export function validateCommentPayload(
  content: string,
  images: string[],
): { ok: true; content: string; images: string[] } | { ok: false; error: string } {
  const trimmed = sanitizeCommentContent(content);
  const normalizedImages = normalizeCommentImages(images);

  if (!trimmed && normalizedImages.length === 0) {
    return { ok: false, error: "empty" };
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: "tooLong" };
  }
  if (images.length > MAX_COMMENT_IMAGES) {
    return { ok: false, error: "tooManyImages" };
  }

  for (const url of images) {
    if (!isAllowedCommentImageUrl(url)) return { ok: false, error: "invalidImageUrl" };
  }

  return { ok: true, content: trimmed, images: normalizedImages };
}

export function validateReportReason(reason: string): { ok: true; reason: string } | { ok: false; error: string } {
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "emptyReason" };
  if (trimmed.length > MAX_REPORT_REASON_LENGTH) return { ok: false, error: "reasonTooLong" };
  return { ok: true, reason: trimmed };
}
