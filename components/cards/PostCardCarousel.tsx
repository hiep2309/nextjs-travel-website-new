"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { ContentCardModel } from "@/lib/cards/types";
import CardBadge from "@/components/ui/CardBadge";
import CardImage from "@/components/ui/CardImage";
import { glassCard } from "@/components/ui/cardStyles";

type Props = {
  card: ContentCardModel;
  footer?: ReactNode;
  overlayBadge?: string;
  overlayBadgePosition?: "left" | "right";
  carousel?: boolean;
  body?: ReactNode;
};

/** Carousel card — Guide home tour & article strips. */
export default function PostCardCarousel({
  card,
  footer,
  overlayBadge,
  overlayBadgePosition = "right",
  carousel = true,
  body,
}: Props) {
  const badgePos =
    overlayBadgePosition === "left" ? "left-2.5 top-2.5" : "right-2.5 top-2.5";

  return (
    <Link
      href={card.href}
      {...(carousel ? { "data-carousel-card": true } : {})}
      className={`group ${glassCard.carousel}`}
    >
      <div className="relative shrink-0">
        <CardImage
          src={card.image}
          alt={card.imageAlt ?? card.title}
          className="relative aspect-[16/10] w-full min-h-[140px] overflow-hidden bg-slate-800"
          sizes="(max-width:640px)90vw,272px"
          hoverScale
          gradient
        />
        {overlayBadge ? (
          <span className={`absolute ${badgePos} z-[1]`}>
            <CardBadge variant="overlay" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
              {overlayBadge}
            </CardBadge>
          </span>
        ) : null}
      </div>
      <div className="relative flex flex-1 flex-col gap-3 p-4">
        {body ?? (
          <>
            <div>
              <h3 className="line-clamp-2 font-semibold leading-snug text-white group-hover:text-amber-100">
                {card.title}
              </h3>
              {card.description ? (
                <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-white/70">
                  {card.description}
                </p>
              ) : null}
            </div>
            {footer}
          </>
        )}
      </div>
    </Link>
  );
}
