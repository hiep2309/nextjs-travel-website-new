/**
 * Sắp xếp bài viết: lượt xem cao trước, sau đó mới nhất theo thời gian đăng.
 */
import { resolvePostType } from "@/lib/postCategories";
import type { TravelPost } from "@/lib/travelPost";

export function getPostViewCount(post: { viewCount?: number; views?: number; number?: number }): number {
  if (typeof post.viewCount === "number") return post.viewCount;
  if (typeof post.views === "number") return post.views;
  if (typeof post.number === "number") return post.number;
  return 0;
}

export function getPostCreatedSeconds(post: TravelPost): number {
  const created = post.createdAt;
  if (created && typeof created === "object" && "seconds" in created) {
    return typeof created.seconds === "number" ? created.seconds : 0;
  }
  return 0;
}

export function sortPostsByViewsThenDate<T extends TravelPost>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const byViews = getPostViewCount(b) - getPostViewCount(a);
    if (byViews !== 0) return byViews;
    return getPostCreatedSeconds(b) - getPostCreatedSeconds(a);
  });
}

export function filterTourSharePosts<T extends TravelPost>(posts: T[]): T[] {
  return posts.filter((p) => resolvePostType(p) === "tour_share");
}
