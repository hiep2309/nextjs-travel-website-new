import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import type { TravelPost } from "@/lib/travelPost";

export const POST_COVER_FALLBACK = "/signup_pic.jpg";

type PostLike = Pick<TravelPost, "image" | "images" | "thumb" | "region">;

/** Prefer uploaded cover, then gallery, then province catalog, then site default. */
export function resolvePostCoverImage(post: PostLike): string {
  const uploaded = [post.image, post.images?.[0], post.thumb].find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  if (uploaded) return uploaded.trim();

  const region = (post.region ?? "").trim();
  if (region) {
    const province = VIETNAM_PROVINCES.find((p) => p.name === region);
    if (province?.image?.trim()) return province.image;
  }

  return POST_COVER_FALLBACK;
}
