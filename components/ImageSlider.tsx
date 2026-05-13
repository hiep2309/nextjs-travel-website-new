/**
 * Carousel ảnh du lịch — luân phiên `TRAVEL_IMAGE_ROTATION`, có nút prev/next và autoplay nhẹ.
 */
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TRAVEL_IMAGE_ROTATION } from "@/lib/travelImageUrls";

const images = TRAVEL_IMAGE_ROTATION;

export default function ImageSlider() {
  const [index, setIndex] = useState(0);

  const go = useCallback((dir: -1 | 1) => {
    setIndex((prev) => (prev + dir + images.length) % images.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl shadow-2xl lg:rounded-3xl">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="relative h-[260px] min-w-full sm:h-[360px] lg:h-[520px]">
            <Image
              src={img}
              alt="Vietnam travel"
              fill
              sizes="(max-width: 768px) 100vw, 440px"
              className="object-cover object-center"
              priority={i === 0}
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
