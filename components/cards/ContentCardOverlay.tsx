"use client";

import { Bookmark, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { glassCard } from "@/components/ui/cardStyles";

type Props = {
  href: string;
  title: string;
  image: string;
  chip: string;
  sub: string;
  extra?: string;
  showSavedIcon?: boolean;
  showRating?: boolean;
};

/** Profile grid overlay card — posts & destinations. */
export default function ContentCardOverlay({
  href,
  title,
  image,
  chip,
  sub,
  extra,
  showSavedIcon,
  showRating,
}: Props) {
  return (
    <Link href={href} className={glassCard.overlay}>
      <div className="relative aspect-[16/11] w-full">
        {image.trim() ? (
          <FlexibleImage
            src={image}
            alt=""
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:640px)100vw,360px"
          />
        ) : (
          <div className="absolute inset-0 bg-white/[0.08]" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/90 backdrop-blur-sm">
          {chip}
        </span>
        {showRating && extra ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-0.5 rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-[#0b0e14]">
            <Star className="size-3 fill-[#0b0e14]" aria-hidden />
            {extra}
          </span>
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-base font-bold leading-snug text-white group-hover:text-amber-200">
            {title}
          </p>
          <p className="mt-1 text-xs text-white/55">{sub}</p>
        </div>
      </div>
      {showSavedIcon ? (
        <Bookmark
          className="absolute bottom-3 right-3 size-5 text-white/80 drop-shadow-md"
          fill="currentColor"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
