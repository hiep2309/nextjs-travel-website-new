"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { canUseNextImage } from "@/lib/imageRemoteHosts";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";
import { DEFAULT_COVER_IMAGE } from "@/lib/publicAssets";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: boolean;
  /** Shown when `src` is empty or fails to load. */
  fallbackSrc?: string;
};

/** Uses `next/image` for local/whitelisted URLs; plain `<img>` for user-provided external links. */
export default function FlexibleImage({
  src,
  alt = "",
  className = "object-cover",
  sizes = "256px",
  priority = false,
  placeholder = true,
  fallbackSrc = DEFAULT_COVER_IMAGE,
}: Props) {
  const primary = src.trim() || fallbackSrc.trim();
  const [currentSrc, setCurrentSrc] = useState(primary);

  useEffect(() => {
    setCurrentSrc(src.trim() || fallbackSrc.trim());
  }, [src, fallbackSrc]);

  if (!currentSrc) return null;

  const handleError = () => {
    const fb = fallbackSrc.trim();
    if (fb && currentSrc !== fb) setCurrentSrc(fb);
  };

  if (canUseNextImage(currentSrc)) {
    return (
      <Image
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        placeholder={placeholder ? "blur" : undefined}
        blurDataURL={placeholder ? BLUR_DATA_URL_LIGHT : undefined}
        onError={handleError}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={`absolute inset-0 h-full w-full ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
}
