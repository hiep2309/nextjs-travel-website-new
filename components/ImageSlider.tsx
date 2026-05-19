/**
 * Carousel ảnh du lịch — luân phiên ảnh trong `public/` (xáo thứ tự khi mở trang), prev/next + autoplay.
 */
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FEATURE_SLIDER_IMAGE_POOL } from "@/lib/homeFeatureSliderImages";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";

function shufflePick<T>(arr: readonly T[], count: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a.slice(0, Math.min(count, a.length));
}

export default function ImageSlider() {
  const [images] = useState(() => shufflePick(FEATURE_SLIDER_IMAGE_POOL, 6));
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((prev) => (prev + dir + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl shadow-2xl lg:rounded-3xl">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={img} className="relative h-[260px] min-w-full sm:h-[360px] lg:h-[520px]">
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 440px"
              className="object-cover object-center"
              priority={i === 0}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL_LIGHT}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/45"}`}
            aria-hidden
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-1 right-1 flex items-center justify-between sm:left-2 sm:right-2">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Ảnh trước"
          className="pointer-events-auto flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/55 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Ảnh sau"
          className="pointer-events-auto flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/55 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
