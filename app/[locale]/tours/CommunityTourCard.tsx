"use client";

import { useTranslations } from "next-intl";
import { PostCardHorizontal } from "@/components/cards";
import { travelPostToContentCard } from "@/lib/cards/adapters";
import { useLocalizedPost } from "@/hooks/useLocalizedPost";
import type { TravelPost } from "@/lib/travelPost";

export function CommunityTourCard({ post }: { post: TravelPost }) {
  const t = useTranslations("Tours");
  const tc = useTranslations("Common");
  const { title, description } = useLocalizedPost(post);

  const card = travelPostToContentCard(post, {
    title,
    description,
    badge: t("community"),
    badgeVariant: "violet",
  });

  return <PostCardHorizontal card={card} regionFallback={tc("vietnam")} />;
}
