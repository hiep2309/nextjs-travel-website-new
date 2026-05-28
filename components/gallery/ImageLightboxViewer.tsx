"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FlexibleImage from "@/components/ui/FlexibleImage";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  X,
} from "lucide-react";

export type ImageLightboxLabels = {
  close: string;
  zoomOut: string;
  zoomIn: string;
  fullscreen: string;
  exitFullscreen: string;
  download: string;
  counter: (current: number, total: number) => string;
};

type Props = {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  labels: ImageLightboxLabels;
};

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 25;

export default function ImageLightboxViewer({
  images,
  initialIndex = 0,
  onClose,
  labels,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = images.length;
  const currentUrl = images[index];
  const canPrev = index > 0;
  const canNext = index < total - 1;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setZoom(100);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1));
    setZoom(100);
  }, [total]);

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = async () => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* unsupported */
    }
  };

  const handleDownload = async () => {
    if (!currentUrl) return;
    try {
      const res = await fetch(currentUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `image-${index + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const a = document.createElement("a");
      a.href = currentUrl;
      a.download = `image-${index + 1}.jpg`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
  };

  if (!currentUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/92 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={labels.counter(index + 1, total)}
      onClick={onClose}
    >
      <div
        ref={shellRef}
        className="flex max-h-[96vh] w-full max-w-6xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c12] shadow-2xl">
          <div className="absolute left-4 top-4 z-10 rounded-lg bg-black/55 px-3 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-sm">
            {labels.counter(index + 1, total)}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/55 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/75"
            aria-label={labels.close}
          >
            <X className="size-5" aria-hidden />
          </button>

          <div className="relative flex min-h-[min(52vh,520px)] items-center justify-center bg-black/40 sm:min-h-[min(58vh,620px)]">
            {canPrev ? (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 sm:left-4"
                aria-label="Previous"
              >
                <ChevronLeft className="size-6" aria-hidden />
              </button>
            ) : null}

            <div className="relative h-[min(52vh,520px)] w-full overflow-hidden sm:h-[min(58vh,620px)]">
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {canNext ? (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 sm:right-4"
                aria-label="Next"
              >
                <ChevronRight className="size-6" aria-hidden />
              </button>
            ) : null}
          </div>

          {total > 1 ? (
            <div className="border-t border-white/10 bg-black/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {images.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      ref={(el) => {
                        thumbRefs.current[i] = el;
                      }}
                      type="button"
                      onClick={() => {
                        setIndex(i);
                        setZoom(100);
                      }}
                      className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:size-[4.5rem] ${
                        i === index
                          ? "border-violet-400 ring-2 ring-violet-400/40"
                          : "border-white/10 opacity-70 hover:opacity-100"
                      }`}
                      aria-label={labels.counter(i + 1, total)}
                      aria-current={i === index ? "true" : undefined}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="size-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#12151c]/95 px-3 py-2 shadow-xl backdrop-blur-md sm:gap-3 sm:px-4">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 px-1 py-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              disabled={zoom <= ZOOM_MIN}
              className="flex size-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 disabled:opacity-40"
              aria-label={labels.zoomOut}
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="min-w-[3.25rem] text-center text-sm font-semibold tabular-nums text-white/90">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
              disabled={zoom >= ZOOM_MAX}
              className="flex size-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 disabled:opacity-40"
              aria-label={labels.zoomIn}
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/80 transition hover:bg-white/10"
            aria-label={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
          >
            {isFullscreen ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
          </button>

          <button
            type="button"
            onClick={() => void handleDownload()}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/80 transition hover:bg-white/10"
            aria-label={labels.download}
          >
            <Download className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
