"use client";

import { Link } from "@/i18n/navigation";
import type { DestinationCardModel } from "@/lib/cards/types";
import CardImage from "@/components/ui/CardImage";
import CardMeta from "@/components/ui/CardMeta";
import { glassCard } from "@/components/ui/cardStyles";

type Props = {
  card: DestinationCardModel;
};

/** Compact destination link — related provinces on detail page. */
export default function DestinationRelatedCard({ card }: Props) {
  return (
    <Link href={card.href} className={glassCard.destinationCompact}>
      <CardImage
        src={card.image}
        alt={card.name}
        className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-800"
        sizes="112px"
        imageClassName="object-cover transition group-hover:scale-105"
      />
      <div className="min-w-0 py-1">
        <p className="font-bold text-white group-hover:text-amber-300">{card.name}</p>
        {card.views !== undefined ? (
          <CardMeta
            views={card.views}
            className="mt-1 text-xs text-slate-400"
            showViews
          />
        ) : null}
      </div>
    </Link>
  );
}
