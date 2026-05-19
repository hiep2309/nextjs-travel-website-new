/**
 * Tiện ích `localStorage` cho hoạt động cá nhân không đồng bộ server:
 *
 * - Địa điểm / bài viết đã lưu, đã xem, đánh giá sao.
 * - Khi đã đăng nhập, mỗi Firebase `uid` có khóa riêng (`baseKey:uid`); khách (chưa đăng nhập)
 *   dùng khóa gốc như trước để không mất dữ liệu ẩn danh trên cùng máy.
 * - Chỉ gọi từ client (guard `typeof window`).
 */

const MAX_HISTORY = 50;

export const ACTIVITY_KEYS = {
  savedDestinations: "vninsight_saved_destinations",
  destinationHistory: "vninsight_destination_history",
  destinationReviews: "vninsight_destination_reviews",
  savedPosts: "vninsight_saved_posts",
  postHistory: "vninsight_post_history",
  postReviews: "vninsight_post_reviews",
} as const;

export type DestinationHistoryEntry = { slug: string; at: number };
export type DestinationReviewEntry = { slug: string; stars: number; at: number };

export type PostMeta = { id: string; title: string; image: string | null };
export type SavedPostEntry = PostMeta & { savedAt: number };
export type PostHistoryEntry = PostMeta & { at: number };
export type PostReviewEntry = PostMeta & { stars: number; at: number };

function resolveKey(baseKey: string, userId?: string | null): string {
  if (typeof userId === "string" && userId.length > 0) return `${baseKey}:${userId}`;
  return baseKey;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function formatRelativeTimeVi(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 45) return "Vừa xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(ts).toLocaleDateString("vi-VN");
}

/** Danh sách slug địa điểm đã lưu (tương thích khóa cũ khi chưa đăng nhập). */
export function getSavedDestinationSlugs(userId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  return safeParse<string[]>(localStorage.getItem(resolveKey(ACTIVITY_KEYS.savedDestinations, userId)), []);
}

export function toggleSavedDestinationSlug(slug: string, userId?: string | null): boolean {
  if (typeof window === "undefined" || !slug) return false;
  try {
    const key = resolveKey(ACTIVITY_KEYS.savedDestinations, userId);
    const list = safeParse<string[]>(localStorage.getItem(key), []);
    const exists = list.includes(slug);
    const next = exists ? list.filter((s) => s !== slug) : [...list, slug];
    localStorage.setItem(key, JSON.stringify(next));
    return !exists;
  } catch {
    return false;
  }
}

export function recordDestinationView(slug: string, userId?: string | null): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    const key = resolveKey(ACTIVITY_KEYS.destinationHistory, userId);
    const list = safeParse<DestinationHistoryEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.slug !== slug);
    const next = [{ slug, at: Date.now() }, ...rest].slice(0, MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getDestinationHistory(userId?: string | null): DestinationHistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<DestinationHistoryEntry[]>(
    localStorage.getItem(resolveKey(ACTIVITY_KEYS.destinationHistory, userId)),
    [],
  );
}

export function setUserDestinationRating(slug: string, stars: number, userId?: string | null): void {
  if (typeof window === "undefined" || !slug || stars < 1 || stars > 5) return;
  try {
    const key = resolveKey(ACTIVITY_KEYS.destinationReviews, userId);
    const list = safeParse<DestinationReviewEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.slug !== slug);
    const next = [...rest, { slug, stars, at: Date.now() }];
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getUserDestinationRatings(userId?: string | null): DestinationReviewEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<DestinationReviewEntry[]>(
    localStorage.getItem(resolveKey(ACTIVITY_KEYS.destinationReviews, userId)),
    [],
  );
}

export function getUserDestinationRating(slug: string, userId?: string | null): number | null {
  const list = getUserDestinationRatings(userId);
  const hit = list.find((x) => x.slug === slug);
  return hit ? hit.stars : null;
}

export function getSavedPosts(userId?: string | null): SavedPostEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<SavedPostEntry[]>(
    localStorage.getItem(resolveKey(ACTIVITY_KEYS.savedPosts, userId)),
    [],
  );
}

export function toggleSavedPost(meta: PostMeta, userId?: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = resolveKey(ACTIVITY_KEYS.savedPosts, userId);
    const list = safeParse<SavedPostEntry[]>(localStorage.getItem(key), []);
    const exists = list.some((p) => p.id === meta.id);
    const next = exists
      ? list.filter((p) => p.id !== meta.id)
      : [...list, { ...meta, savedAt: Date.now() }];
    localStorage.setItem(key, JSON.stringify(next));
    return !exists;
  } catch {
    return false;
  }
}

export function isPostSaved(id: string, userId?: string | null): boolean {
  return getSavedPosts(userId).some((p) => p.id === id);
}

export function recordPostView(meta: PostMeta, userId?: string | null): void {
  if (typeof window === "undefined" || !meta.id) return;
  try {
    const key = resolveKey(ACTIVITY_KEYS.postHistory, userId);
    const list = safeParse<PostHistoryEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.id !== meta.id);
    const next = [{ ...meta, at: Date.now() }, ...rest].slice(0, MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getPostHistory(userId?: string | null): PostHistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<PostHistoryEntry[]>(
    localStorage.getItem(resolveKey(ACTIVITY_KEYS.postHistory, userId)),
    [],
  );
}

export function setUserPostRating(meta: PostMeta, stars: number, userId?: string | null): void {
  if (typeof window === "undefined" || !meta.id || stars < 1 || stars > 5) return;
  try {
    const key = resolveKey(ACTIVITY_KEYS.postReviews, userId);
    const list = safeParse<PostReviewEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.id !== meta.id);
    const next = [...rest, { ...meta, stars, at: Date.now() }];
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getUserPostRatings(userId?: string | null): PostReviewEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<PostReviewEntry[]>(
    localStorage.getItem(resolveKey(ACTIVITY_KEYS.postReviews, userId)),
    [],
  );
}

export function getUserPostRating(id: string, userId?: string | null): number | null {
  const hit = getUserPostRatings(userId).find((x) => x.id === id);
  return hit ? hit.stars : null;
}
