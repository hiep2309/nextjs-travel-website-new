import { normalizeVietnameseText } from "@/lib/normalizeVn";
import { getPostViewCount } from "@/lib/posts/sortPosts";
import type { TravelPost } from "@/lib/travelPost";

/** Match Firestore `region` to a province name (Vietnamese catalog). */
export function postMatchesProvince(post: TravelPost, provinceName: string): boolean {
  const needle = normalizeVietnameseText(provinceName);
  if (!needle) return false;
  const region = normalizeVietnameseText(post.region || "");
  if (!region) return false;
  return region === needle || region.includes(needle);
}

export function filterPostsByProvince(posts: TravelPost[], provinceName: string): TravelPost[] {
  return posts.filter((post) => postMatchesProvince(post, provinceName));
}

export function sumPostViewsForProvince(posts: TravelPost[], provinceName: string): number {
  return filterPostsByProvince(posts, provinceName).reduce(
    (sum, post) => sum + getPostViewCount(post),
    0,
  );
}

export type ProvincePostImage = { url: string; postId: string };

/** Collect unique image URLs from posts about a province (cover + gallery). */
export function collectImagesFromPosts(posts: TravelPost[]): ProvincePostImage[] {
  const seen = new Set<string>();
  const out: ProvincePostImage[] = [];

  for (const post of posts) {
    const urls = [
      ...(Array.isArray(post.images) ? post.images : []),
      post.image,
      post.thumb,
    ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);

    for (const raw of urls) {
      const url = raw.trim();
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ url, postId: post.id });
    }
  }

  return out;
}
