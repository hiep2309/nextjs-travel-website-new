"use client";

import Image from "next/image";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  hoverScale?: boolean;
  gradient?: boolean;
  placeholder?: boolean;
};

export default function CardImage({
  src,
  alt = "",
  className = "relative bg-slate-800",
  imageClassName = "object-cover",
  sizes = "256px",
  priority = false,
  hoverScale = false,
  gradient = false,
  placeholder = true,
}: Props) {
  const trimmed = src?.trim();
  return (
    <div className={className}>
      {trimmed ? (
        <Image
          src={trimmed}
          alt={alt}
          fill
          className={`${imageClassName}${hoverScale ? " transition duration-700 ease-out group-hover:scale-[1.03]" : ""}`}
          sizes={sizes}
          priority={priority}
          placeholder={placeholder ? "blur" : undefined}
          blurDataURL={placeholder ? BLUR_DATA_URL_LIGHT : undefined}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-800/90" aria-hidden />
      )}
      {gradient ? (
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
