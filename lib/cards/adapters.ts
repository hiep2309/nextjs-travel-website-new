import type { RelatedDestination } from "@/lib/destinationPageModel";
import type { TravelPost } from "@/lib/travelPost";
import type { CardBadgeVariant, ContentCardModel, DestinationCardModel } from "./types";

type PostCardOptions = {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: CardBadgeVariant;
};

export function travelPostToContentCard(
  post: TravelPost,
  { title, description, badge, badgeVariant = "amber" }: PostCardOptions,
): ContentCardModel {
  return {
    href: `/posts/${post.id}`,
    title,
    description,
    image: post.image,
    badge,
    badgeVariant,
    region: post.region,
    views: post.viewCount ?? 0,
    travelTime: post.travelTime,
  };
}

export function relatedDestinationToCard(item: RelatedDestination): DestinationCardModel {
  return {
    href: `/destinations/${item.slug}`,
    name: item.name,
    image: item.image,
    views: item.views,
  };
}

/** Profile saved/history/reviews grid row. */
export function profileRowToOverlayCard(row: {
  href: string;
  title: string;
  image: string;
  sub: string;
  chip: string;
  extra?: string;
}): ContentCardModel & { chip: string; sub: string; extra?: string } {
  return {
    href: row.href,
    title: row.title,
    image: row.image,
    badge: row.chip,
    badgeVariant: "overlay",
    metaLine: row.sub,
    chip: row.chip,
    sub: row.sub,
    extra: row.extra,
  };
}
