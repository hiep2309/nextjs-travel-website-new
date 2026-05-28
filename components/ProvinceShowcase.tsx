/**
 * Showcase 34 tỉnh/thành (2025) trên trang chủ — hero ảnh lớn + thanh carousel thẻ địa phương.
 *
 * Chức năng:
 * - Thanh thẻ: thẻ đang chọn luôn căn giữa khung; đổi tỉnh bằng chạm thẻ, nút ◀ ▶ hoặc phím ← →.
 * - CTA dẫn tới `/destinations/[slug]` theo `provinceNameToSlug`.
 */
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { VIETNAM_PROVINCES, type ProvinceDef } from "@/lib/vietnamProvinces";
import { provinceNameToSlug } from "@/lib/provinceSlug";
import { BLUR_DATA_URL_LIGHT } from "@/lib/imagePlaceholder";
import { useRegionLabel } from "@/hooks/useRegionLabel";
import { useLocalizedProvince, useLocalizedProvinceName } from "@/hooks/useLocalizedProvince";

const provinces = VIETNAM_PROVINCES;
const defaultIndex = Math.max(0, provinces.findIndex((p) => p.name === "Đà Nẵng"));

const FLY_MS = 560;

type FlyState = {
  src: string;
  from: { left: number; top: number; width: number; height: number };
  to: { left: number; top: number; width: number; height: number };
};

const ThumbImage = memo(function ThumbImage({ src, eager }: { src: string; eager: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (!src.trim() || failed) {
    return <div className="absolute inset-0 bg-slate-700/95" aria-hidden />;
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      className="object-cover transition duration-300 group-hover:scale-105"
      sizes="130px"
      loading={eager ? "eager" : "lazy"}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL_LIGHT}
      onError={() => setFailed(true)}
    />
  );
});

function ProvinceChip({
  province,
  index,
  activeIndex,
  onPick,
  chipRef,
  thumbRef,
}: {
  province: ProvinceDef;
  index: number;
  activeIndex: number;
  onPick: (index: number) => void;
  chipRef: (el: HTMLButtonElement | null) => void;
  thumbRef: (el: HTMLDivElement | null) => void;
}) {
  const t = useTranslations("Province");
  const regionLabel = useRegionLabel(province.region);
  const localizedName = useLocalizedProvinceName(province.name);

  return (
    <button
      ref={chipRef}
      type="button"
      onClick={() => onPick(index)}
      title={`${localizedName} — ${regionLabel}`}
      className={`group relative flex h-[150px] w-[120px] shrink-0 snap-center flex-col overflow-hidden rounded-xl border text-left shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80 sm:h-[158px] sm:w-[128px] ${
        index === activeIndex
          ? "z-[1] scale-[1.06] border-2 border-violet-300/70 shadow-xl shadow-violet-950/40 ring-2 ring-violet-400/80 snap-center"
          : "border-white/25 bg-slate-900/60 hover:border-white/50 hover:scale-[1.02] snap-center"
      }`}
      aria-label={t("selectProvince", { name: localizedName, region: regionLabel })}
      aria-current={index === activeIndex ? "true" : undefined}
    >
      <div className="pointer-events-none absolute left-1.5 top-1.5 z-[2] flex items-center gap-0.5 rounded bg-black/55 px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/15">
        <MapPin className="size-2.5 opacity-90" aria-hidden />
        {t("vietnam")}
      </div>
      <div ref={thumbRef} className="relative min-h-0 w-full flex-1 bg-slate-800">
        <ThumbImage src={province.image} eager={index < 12} />
      </div>
      <div className="shrink-0 border-t border-white/10 bg-gradient-to-t from-black/95 via-black/90 to-black/80 px-1.5 py-2 backdrop-blur-md">
        <p className="line-clamp-1 text-[7px] font-semibold uppercase leading-tight tracking-wide text-white/75">
          {regionLabel.toLocaleUpperCase()}
        </p>
        <p className="mt-0.5 line-clamp-2 break-words text-[11px] font-bold leading-snug text-white drop-shadow-sm">
          {localizedName}
        </p>
      </div>
    </button>
  );
}

function rectRelativeTo(root: DOMRect, inner: DOMRect) {
  return {
    left: inner.left - root.left,
    top: inner.top - root.top,
    width: inner.width,
    height: inner.height,
  };
}

export default function ProvinceShowcase() {
  const t = useTranslations("Province");
  const tDest = useTranslations("Destinations");
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [heroSrc, setHeroSrc] = useState(provinces[defaultIndex].image);
  const [fly, setFly] = useState<FlyState | null>(null);

  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbImgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const flyLayerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const flyDoneTimerRef = useRef<number | null>(null);
  const isFirstCenterRef = useRef(true);

  const activeProvince = useMemo(() => provinces[activeIndex], [activeIndex]);
  const activeLocalized = useLocalizedProvince(activeProvince);
  const activeRegionLabel = useRegionLabel(activeProvince.region);
  const heroSummary = activeLocalized.summary;
  const heroIntro = tDest("introBody", {
    name: activeLocalized.name,
    region: activeRegionLabel,
    summary: heroSummary,
  });
  activeIndexRef.current = activeIndex;

  const startFlyFromThumb = useCallback((index: number) => {
    const thumbEl = thumbImgRefs.current[index];
    const heroEl = heroBgRef.current;
    const src = provinces[index].image;
    if (!src.trim()) {
      setHeroSrc("");
      setFly(null);
      return;
    }
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
    (index: number) => {
      if (index === activeIndexRef.current) return;
      setActiveIndex(index);
      startFlyFromThumb(index);
    },
    [startFlyFromThumb],
  );

  const goPrevProvince = useCallback(() => {
    const i = activeIndexRef.current;
    if (i <= 0) return;
    pickProvince(i - 1);
  }, [pickProvince]);

  const goNextProvince = useCallback(() => {
    const i = activeIndexRef.current;
    if (i >= provinces.length - 1) return;
    pickProvince(i + 1);
  }, [pickProvince]);

  /** Cuộn danh sách để thẻ `index` nằm giữa vùng nhìn thấy của scroller. */
  const centerChipAtIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollerRef.current;
    const chip = chipRefs.current[index];
    if (!scroller || !chip) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const chipCenterX = chipRect.left + chipRect.width / 2;
    const scrollerCenterX = scrollerRect.left + scrollerRect.width / 2;
    const delta = chipCenterX - scrollerCenterX;
    scroller.scrollBy({ left: delta, behavior });
  }, []);

  useLayoutEffect(() => {
    if (!fly?.src?.trim()) {
      if (fly) {
        setHeroSrc("");
        setFly(null);
      }
      return;
    }
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

  useLayoutEffect(() => {
    const behavior: ScrollBehavior = isFirstCenterRef.current ? "auto" : "smooth";
    isFirstCenterRef.current = false;
    const id = requestAnimationFrame(() => centerChipAtIndex(activeIndex, behavior));
    return () => cancelAnimationFrame(id);
  }, [activeIndex, centerChipAtIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevProvince();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNextProvince();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrevProvince, goNextProvince]);

  return (
    <section className="py-12 text-white sm:py-16 lg:py-20" aria-label="Khám phá 34 tỉnh thành">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-2xl backdrop-blur-sm lg:rounded-3xl">
          <div ref={heroBgRef} className="relative h-[min(74vh,560px)] sm:h-[580px] lg:h-[620px]">
            {heroSrc.trim() ? (
              <Image
                src={heroSrc}
                alt={activeProvince.name}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority={activeIndex === defaultIndex}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL_LIGHT}
                onError={() => setHeroSrc("")}
              />
            ) : (
              <div className="absolute inset-0 bg-slate-800" aria-hidden />
            )}

            {fly?.src?.trim() ? (
              <div
                ref={flyLayerRef}
                className="pointer-events-none absolute z-[12] overflow-hidden shadow-2xl ring-1 ring-white/25"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fly.src}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                  onError={() => setFly(null)}
                />
              </div>
            ) : null}

            <div className="absolute inset-0 z-[15] bg-gradient-to-r from-black/88 via-black/55 to-black/45" />
            <div className="absolute inset-0 z-[15] bg-gradient-to-t from-black/92 via-black/35 to-transparent" />

            <div className="absolute left-4 top-6 z-20 max-w-[min(100%,580px)] sm:left-6 sm:top-8 lg:left-8 lg:top-10">
              <div className="rounded-2xl border border-white/10 bg-black/65 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6 lg:rounded-3xl lg:p-7">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 sm:text-xs">
                  <MapPin className="size-3.5 shrink-0 text-violet-300" aria-hidden />
                  {activeRegionLabel.toLocaleUpperCase()} · {t("vietnam")}
                </p>
                <h2 className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {activeLocalized.name.toLocaleUpperCase()}
                </h2>
                <div
                  className="mt-4 h-0.5 w-14 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 sm:mt-5"
                  aria-hidden
                />
                <Link
                  href={`/destinations/${provinceNameToSlug(activeProvince.name)}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-blue-500 sm:mt-6"
                >
                  <MapPin className="size-4 shrink-0 opacity-90" aria-hidden />
                  {t("cta")}
                  <ChevronRight className="size-4 shrink-0 opacity-90" aria-hidden />
                </Link>
                <p
                  key={activeProvince.name}
                  className="mt-5 text-sm leading-relaxed text-white/92 sm:mt-6 sm:text-[15px] sm:leading-7"
                  aria-live="polite"
                >
                  {heroIntro}
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent pb-3 pt-14 sm:pb-4 sm:pt-16 lg:pt-20">
              <div className="mx-auto flex max-w-[1200px] justify-end px-4 sm:px-6 lg:px-8">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-2 py-1.5 shadow-lg backdrop-blur-md">
                  <button
                    type="button"
                    onClick={goPrevProvince}
                    disabled={activeIndex <= 0}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-35 sm:size-10"
                    aria-label={t("prevProvince")}
                  >
                    <ChevronLeft className="size-5 stroke-[2.25]" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={goNextProvince}
                    disabled={activeIndex >= provinces.length - 1}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white text-slate-900 transition hover:bg-white/95 disabled:pointer-events-none disabled:opacity-35 sm:size-10"
                    aria-label={t("nextProvince")}
                  >
                    <ChevronRight className="size-5 stroke-[2.25]" aria-hidden />
                  </button>
                  <span
                    className="shrink-0 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold tabular-nums text-white"
                    aria-live="polite"
                  >
                    {activeIndex + 1} / {provinces.length}
                  </span>
                </div>
              </div>
              <div
                ref={scrollerRef}
                tabIndex={0}
                role="listbox"
                aria-label={t("carouselAria")}
                className="hide-scrollbar mx-auto mt-5 flex max-w-[1200px] flex-row flex-nowrap gap-3 overflow-x-auto overscroll-x-contain pb-2 pt-1 pl-[max(1rem,calc(50%-60px))] pr-[max(1rem,calc(50%-60px))] sm:mt-6 sm:pl-[max(1.5rem,calc(50%-64px))] sm:pr-[max(1.5rem,calc(50%-64px))] focus:outline-none"
              >
                {provinces.map((province, index) => (
                  <ProvinceChip
                    key={province.name}
                    province={province}
                    index={index}
                    activeIndex={activeIndex}
                    onPick={pickProvince}
                    chipRef={(el) => {
                      chipRefs.current[index] = el;
                    }}
                    thumbRef={(el) => {
                      thumbImgRefs.current[index] = el;
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
