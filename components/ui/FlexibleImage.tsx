"use client";

import Image from "next/image";
import { canUseNextImage } from "@/lib/imageRemoteHosts";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: boolean;
};

/** Uses `next/image` for local/whitelisted URLs; plain `<img>` for user-provided external links. */
export default function FlexibleImage({
  src,
  alt = "",
  className = "object-cover",
  sizes = "256px",
  priority = false,
  placeholder = true,
}: Props) {
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (canUseNextImage(trimmed)) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        placeholder={placeholder ? "blur" : undefined}
        blurDataURL={placeholder ? BLUR_DATA_URL_LIGHT : undefined}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt={alt}
      className={`absolute inset-0 h-full w-full ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
