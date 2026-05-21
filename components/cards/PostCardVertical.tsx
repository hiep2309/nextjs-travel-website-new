"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { ContentCardModel } from "@/lib/cards/types";
import CardBadge from "@/components/ui/CardBadge";
import CardImage from "@/components/ui/CardImage";
import CardMeta from "@/components/ui/CardMeta";
import { glassCard } from "@/components/ui/cardStyles";

type Props = {
  card: ContentCardModel;
  actions?: ReactNode;
  emptyDescription?: string;
  regionFallback?: string;
};

/** Vertical grid card — Explore, similar layouts. */
export default function PostCardVertical({
  card,
  actions,
  emptyDescription,
  regionFallback,
}: Props) {
  return (
    <article className={`relative h-full ${glassCard.vertical}`}>
      {actions}
      <Link href={card.href} className="group block h-full">
        <CardImage
          src={card.image}
          alt={card.imageAlt ?? card.title}
          className="relative h-48 bg-slate-800"
          sizes="(max-width:768px)100vw,33vw"
        />
        <div className="p-4 sm:p-5">
          <p className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/70">
            {card.badge ? (
              <CardBadge variant={card.badgeVariant ?? "amber"}>{card.badge}</CardBadge>
            ) : null}
            <span>{card.region || regionFallback}</span>
          </p>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-amber-100">
            {card.title}
          </h3>
          <p className="line-clamp-3 text-sm text-white/75">{card.description || emptyDescription}</p>
          <CardMeta
            views={card.views}
            showViews={card.views !== undefined}
            className="mt-3 inline-flex items-center gap-1 text-xs text-white/55"
            region={undefined}
          />
        </div>
      </Link>
    </article>
  );
}
