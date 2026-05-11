/** Lưu hoạt động người dùng trên trình duyệt (đã lưu / lịch sử / đánh giá). Chỉ gọi từ client. */

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

/** Danh sách slug địa điểm đã lưu (key cũ, dùng chung với DestinationDetailClient). */
export function getSavedDestinationSlugs(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse<string[]>(localStorage.getItem(ACTIVITY_KEYS.savedDestinations), []);
}

export function recordDestinationView(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    const key = ACTIVITY_KEYS.destinationHistory;
    const list = safeParse<DestinationHistoryEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.slug !== slug);
    const next = [{ slug, at: Date.now() }, ...rest].slice(0, MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getDestinationHistory(): DestinationHistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<DestinationHistoryEntry[]>(
    localStorage.getItem(ACTIVITY_KEYS.destinationHistory),
    [],
  );
}

export function setUserDestinationRating(slug: string, stars: number): void {
  if (typeof window === "undefined" || !slug || stars < 1 || stars > 5) return;
  try {
    const key = ACTIVITY_KEYS.destinationReviews;
    const list = safeParse<DestinationReviewEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.slug !== slug);
    const next = [...rest, { slug, stars, at: Date.now() }];
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getUserDestinationRatings(): DestinationReviewEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<DestinationReviewEntry[]>(
    localStorage.getItem(ACTIVITY_KEYS.destinationReviews),
    [],
  );
}

export function getUserDestinationRating(slug: string): number | null {
  const list = getUserDestinationRatings();
  const hit = list.find((x) => x.slug === slug);
  return hit ? hit.stars : null;
}

export function getSavedPosts(): SavedPostEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<SavedPostEntry[]>(localStorage.getItem(ACTIVITY_KEYS.savedPosts), []);
}

export function toggleSavedPost(meta: PostMeta): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = ACTIVITY_KEYS.savedPosts;
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

export function isPostSaved(id: string): boolean {
  return getSavedPosts().some((p) => p.id === id);
}

export function recordPostView(meta: PostMeta): void {
  if (typeof window === "undefined" || !meta.id) return;
  try {
    const key = ACTIVITY_KEYS.postHistory;
    const list = safeParse<PostHistoryEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.id !== meta.id);
    const next = [{ ...meta, at: Date.now() }, ...rest].slice(0, MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getPostHistory(): PostHistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<PostHistoryEntry[]>(localStorage.getItem(ACTIVITY_KEYS.postHistory), []);
}

export function setUserPostRating(meta: PostMeta, stars: number): void {
  if (typeof window === "undefined" || !meta.id || stars < 1 || stars > 5) return;
  try {
    const key = ACTIVITY_KEYS.postReviews;
    const list = safeParse<PostReviewEntry[]>(localStorage.getItem(key), []);
    const rest = list.filter((x) => x.id !== meta.id);
    const next = [...rest, { ...meta, stars, at: Date.now() }];
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getUserPostRatings(): PostReviewEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<PostReviewEntry[]>(localStorage.getItem(ACTIVITY_KEYS.postReviews), []);
}

export function getUserPostRating(id: string): number | null {
  const hit = getUserPostRatings().find((x) => x.id === id);
  return hit ? hit.stars : null;
}
