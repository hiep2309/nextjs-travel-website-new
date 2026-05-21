"use client";

import { Link } from "@/i18n/navigation";
import type { ContentCardModel } from "@/lib/cards/types";
import CardBadge from "@/components/ui/CardBadge";
import CardImage from "@/components/ui/CardImage";
import CardMeta from "@/components/ui/CardMeta";
import { glassCard } from "@/components/ui/cardStyles";

type Props = {
  card: ContentCardModel;
  titleAs?: "h2" | "h3";
  regionFallback?: string;
};

/** Horizontal list row — Tours, Guides. */
export default function PostCardHorizontal({ card, titleAs = "h3", regionFallback }: Props) {
  const TitleTag = titleAs;

  return (
    <article className={glassCard.horizontal}>
      <Link href={card.href} className="group flex flex-col sm:flex-row">
        <CardImage
          src={card.image}
          alt={card.imageAlt ?? card.title}
          className="relative aspect-[16/10] shrink-0 bg-slate-800 sm:aspect-auto sm:h-48 sm:w-64"
          sizes="256px"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6">
          {card.badge ? (
            <CardBadge variant={card.badgeVariant ?? "amber"} size="md">
              {card.badge}
            </CardBadge>
          ) : null}
          <TitleTag className="mt-3 text-xl font-bold sm:text-2xl group-hover:text-amber-100">
            {card.title}
          </TitleTag>
          {card.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-[#b4bfce]">{card.description}</p>
          ) : null}
          <CardMeta
            region={card.region || regionFallback}
            views={card.views}
            travelTime={card.travelTime}
            metaLine={card.metaLine}
            className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8892a8]"
          />
        </div>
      </Link>
    </article>
  );
}
