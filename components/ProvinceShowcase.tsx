"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";

const provinces = VIETNAM_PROVINCES;
const defaultIndex = Math.max(0, provinces.findIndex((p) => p.name === "Đà Nẵng"));

const FLY_MS = 560;

type FlyState = {
  src: string;
  from: { left: number; top: number; width: number; height: number };
  to: { left: number; top: number; width: number; height: number };
};

function rectRelativeTo(root: DOMRect, inner: DOMRect) {
  return {
    left: inner.left - root.left,
    top: inner.top - root.top,
    width: inner.width,
    height: inner.height,
  };
}

export default function ProvinceShowcase() {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [heroSrc, setHeroSrc] = useState(provinces[defaultIndex].image);
  const [fly, setFly] = useState<FlyState | null>(null);

  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbImgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const flyLayerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const skipScrollPickRef = useRef(false);
  const flyDoneTimerRef = useRef<number | null>(null);
  const scrollPickTimerRef = useRef<number | null>(null);

  const activeProvince = useMemo(() => provinces[activeIndex], [activeIndex]);
  activeIndexRef.current = activeIndex;

  const startFlyFromThumb = useCallback((index: number) => {
    const thumbEl = thumbImgRefs.current[index];
    const heroEl = heroBgRef.current;
    const src = provinces[index].image;
    if (!thumbEl || !heroEl) {
      setHeroSrc(src);
      setFly(null);
      return;
    }
    const heroR = heroEl.getBoundingClientRect();
    const from = rectRelativeTo(heroR, thumbEl.getBoundingClientRect());
    const to = { left: 0, top: 0, width: heroR.width, height: heroR.height };
    setFly({ src, from, to });
  }, []);

  const pickProvince = useCallback(
    (index: number, opts?: { fromUserClick?: boolean }) => {
      if (index === activeIndexRef.current) return;
      if (opts?.fromUserClick) {
        skipScrollPickRef.current = true;
        window.setTimeout(() => {
          skipScrollPickRef.current = false;
        }, 650);
      }
      setActiveIndex(index);
      startFlyFromThumb(index);
    },
    [startFlyFromThumb],
  );

  useLayoutEffect(() => {
    if (!fly) return;
    const el = flyLayerRef.current;
    if (!el) return;

    if (flyDoneTimerRef.current) {
      clearTimeout(flyDoneTimerRef.current);
      flyDoneTimerRef.current = null;
    }

    const { from, to } = fly;
    el.style.transition = "none";
    el.style.left = `${from.left}px`;
    el.style.top = `${from.top}px`;
    el.style.width = `${from.width}px`;
    el.style.height = `${from.height}px`;
    el.style.borderRadius = "12px";
    el.style.opacity = "1";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `left ${FLY_MS}ms cubic-bezier(0.33, 1, 0.68, 1), top ${FLY_MS}ms cubic-bezier(0.33, 1, 0.68, 1), width ${FLY_MS}ms cubic-bezier(0.33, 1, 0.68, 1), height ${FLY_MS}ms cubic-bezier(0.33, 1, 0.68, 1), border-radius ${FLY_MS}ms ease, box-shadow ${FLY_MS}ms ease`;
        el.style.left = `${to.left}px`;
        el.style.top = `${to.top}px`;
        el.style.width = `${to.width}px`;
        el.style.height = `${to.height}px`;
        el.style.borderRadius = "1.5rem";
      });
    });

    flyDoneTimerRef.current = window.setTimeout(() => {
      setHeroSrc(fly.src);
      setFly(null);
      flyDoneTimerRef.current = null;
    }, FLY_MS + 40);

    return () => {
      if (flyDoneTimerRef.current) {
        clearTimeout(flyDoneTimerRef.current);
        flyDoneTimerRef.current = null;
      }
    };
  }, [fly]);

  useEffect(() => {
    chipRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const settlePickFromScroll = () => {
      if (skipScrollPickRef.current) return;
      const rect = root.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < chipRefs.current.length; i++) {
        const btn = chipRefs.current[i];
        if (!btn) continue;
        const r = btn.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (best >= 0 && best !== activeIndexRef.current) {
        pickProvince(best);
      }
    };

    const onScroll = () => {
      if (scrollPickTimerRef.current) clearTimeout(scrollPickTimerRef.current);
      scrollPickTimerRef.current = window.setTimeout(settlePickFromScroll, 160);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (scrollPickTimerRef.current) clearTimeout(scrollPickTimerRef.current);
    };
  }, [pickProvince]);

  return (
    <section className="py-12 text-white sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-2xl backdrop-blur-sm lg:rounded-3xl">
          <div ref={heroBgRef} className="relative h-[min(74vh,560px)] sm:h-[580px] lg:h-[620px]">
            <Image
              src={heroSrc}
              alt={activeProvince.name}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority={activeIndex === defaultIndex}
            />

            {fly ? (
              <div
                ref={flyLayerRef}
                className="pointer-events-none absolute z-[12] overflow-hidden shadow-2xl ring-1 ring-white/25"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fly.src} alt="" className="h-full w-full object-cover" draggable={false} />
              </div>
            ) : null}

            <div className="absolute inset-0 z-[15] bg-gradient-to-r from-black/78 via-black/40 to-black/55" />
            <div className="absolute inset-0 z-[15] bg-gradient-to-t from-black/82 via-black/20 to-black/40" />

            <div className="absolute left-4 top-8 z-20 max-w-[min(100%,620px)] pr-4 sm:left-7 sm:top-12 lg:left-10 lg:top-14">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-xs">
                {activeProvince.region.toLocaleUpperCase("vi-VN")} · VIỆT NAM
              </p>
              <h2 className="mb-4 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
                {activeProvince.name.toLocaleUpperCase("vi-VN")}
              </h2>
              <p className="mb-7 max-w-[520px] text-sm font-medium leading-relaxed text-white/90 sm:text-base">
                {activeProvince.summary}
              </p>
              <Link
                href={`/explore?province=${encodeURIComponent(activeProvince.name)}`}
                className="inline-flex items-center rounded-full bg-black/50 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-black/60"
              >
                Xem bài viết địa điểm
              </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/55 to-transparent pb-4 pt-16 sm:pb-5 sm:pt-20">
              <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 sm:flex-row sm:items-end sm:px-6 lg:px-8">
                <p className="max-w-[28rem] text-[10px] font-semibold uppercase leading-snug tracking-[0.2em] text-white/70 sm:text-[11px]">
                  {provinces.length} tỉnh, thành — chọn để xem bài viết
                </p>
                <span
                  className="ml-auto shrink-0 rounded-full border border-white/25 bg-black/45 px-3 py-1 text-[11px] font-semibold tabular-nums text-white/95 backdrop-blur-md"
                  aria-live="polite"
                >
                  {activeIndex + 1} / {provinces.length}
                </span>
              </div>
              <div
                ref={scrollerRef}
                className="mx-auto mt-3 flex max-w-[1200px] flex-row flex-nowrap gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 pt-1 snap-x snap-mandatory [scrollbar-width:thin] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25"
              >
                {provinces.map((province, index) => (
                  <button
                    key={province.name}
                    ref={(el) => {
                      chipRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => pickProvince(index, { fromUserClick: true })}
                    title={`${province.name} — ${province.region}`}
                    className={`group relative flex h-[150px] w-[120px] shrink-0 snap-center flex-col overflow-hidden rounded-xl border text-left shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 sm:h-[158px] sm:w-[128px] ${
                      index === activeIndex
                        ? "z-[1] scale-[1.06] border-2 border-white shadow-xl shadow-black/50 ring-2 ring-amber-400/70"
                        : "border-white/25 bg-slate-900/40 hover:border-white/50 hover:scale-[1.02]"
                    }`}
                    aria-label={`Chọn ${province.name}, ${province.region}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  >
                    <div className="pointer-events-none absolute left-1.5 top-1.5 z-[2] flex items-center gap-0.5 rounded bg-black/55 px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/15">
                      <MapPin className="size-2.5 opacity-90" aria-hidden />
                      VIETNAM
                    </div>
                    <div
                      ref={(el) => {
                        thumbImgRefs.current[index] = el;
                      }}
                      className="relative min-h-0 w-full flex-1 bg-slate-800"
                    >
                      <Image
                        src={province.image}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        sizes="130px"
                        loading={index < 12 ? "eager" : "lazy"}
                      />
                    </div>
                    <div className="shrink-0 border-t border-white/10 bg-black/85 px-1.5 py-2 backdrop-blur-md">
                      <p className="line-clamp-1 text-[7px] font-semibold uppercase leading-tight tracking-wide text-white/65">
                        {province.region.toLocaleUpperCase("vi-VN")}
                      </p>
                      <p className="mt-0.5 line-clamp-2 break-words text-[11px] font-bold leading-snug text-white">
                        {province.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
