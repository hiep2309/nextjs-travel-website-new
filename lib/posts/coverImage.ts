import { DEFAULT_COVER_IMAGE } from "@/lib/publicAssets";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import type { TravelPost } from "@/lib/travelPost";

export const POST_COVER_FALLBACK = DEFAULT_COVER_IMAGE;

export type PostLike = Pick<TravelPost, "image" | "images" | "thumb" | "region">;

export function resolvePostCoverImage(post: PostLike): string {
  const direct =
    post.image?.trim() ||
    (Array.isArray(post.images) ? post.images.find((u) => u?.trim()) : undefined) ||
    post.thumb?.trim();
  if (direct) return direct;

  const region = post.region?.trim();
  if (region) {
    const province = VIETNAM_PROVINCES.find(
      (p) => p.name === region || region.includes(p.name) || p.name.includes(region),
    );
    if (province?.image?.trim()) return province.image;
  }

  return POST_COVER_FALLBACK;
}
