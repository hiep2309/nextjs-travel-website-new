"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, Tag } from "lucide-react";
import { TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";

type TourCard = {
  title: string;
  location: string;
  badge: string;
  duration: string;
  categories: string;
  price: string;
  image: string;
};

type ArticleCard = {
  title: string;
  excerpt: string;
  badge: string;
  readTime: string;
  date: string;
  image: string;
  href?: string;
};

const TOURS: TourCard[] = [
  {
    title: "Sapa Trekking 2N1Đ",
    location: "Sapa, Lào Cai",
    badge: "Bán chạy",
    duration: "2 ngày 1 đêm",
    categories: "Trekking, Văn hóa",
    price: "Từ 2.250.000 VND",
    image: TRAVEL_IMAGE_URLS.terraces,
  },
  {
    title: "Hạ Long trong ngày",
    location: "Quảng Ninh",
    badge: "Yêu thích",
    duration: "1 ngày",
    categories: "Biển đảo, Thuyền kayak",
    price: "Từ 1.890.000 VND",
    image: TRAVEL_IMAGE_URLS.boats,
  },
  {
    title: "Hội An — Đêm lồng đèn",
    location: "Hội An, Quảng Nam",
    badge: "Bán chạy",
    duration: "3 ngày 2 đêm",
    categories: "Văn hóa, Ẩm thực",
    price: "Từ 3.400.000 VND",
    image: TRAVEL_IMAGE_URLS.oldTown,
  },
  {
    title: "Phú Quốc nghỉ dưỡng",
    location: "Phú Quốc, Kiên Giang",
    badge: "Mới",
    duration: "4 ngày 3 đêm",
    categories: "Biển, Resort",
    price: "Từ 4.990.000 VND",
    image: TRAVEL_IMAGE_URLS.beach,
  },
  {
    title: "Mù Cang Chải mùa vàng",
    location: "Mù Cang Chải, Yên Bái",
    badge: "Yêu thích",
    duration: "2 ngày 1 đêm",
    categories: "Cảnh quan, Chụp ảnh",
    price: "Từ 2.050.000 VND",
    image: TRAVEL_IMAGE_URLS.mountains,
  },
];

const ARTICLES: ArticleCard[] = [
  {
    title: "Mùa vàng ở Mù Cang Chải — những điều cần biết",
    excerpt:
      "Thời điểm lý tưởng, lộ trình gợi ý và mẹo chụp ảnh ruộng bậc thang trong một chuyến đi.",
    badge: "Điểm đến",
    readTime: "15 phút đọc",
    date: "20/05/2026",
    image: TRAVEL_IMAGE_URLS.terraces,
    href: "/guides",
  },
  {
    title: "Kinh nghiệm ăn uống ở Hội An",
    excerpt:
      "Các quán địa phương, món không thể bỏ lỡ và cách tránh đông đúc vào cuối tuần.",
    badge: "Kinh nghiệm",
    readTime: "8 phút đọc",
    date: "12/05/2026",
    image: TRAVEL_IMAGE_URLS.oldTown,
    href: "/guides",
  },
  {
    title: "Lịch trình 1 ngày khám phá cố đô Huế",
    excerpt:
      "Điểm tham quan nổi bật, phương tiện di chuyển và gợi ý thời gian hợp lý trong ngày.",
    badge: "Hướng dẫn",
    readTime: "12 phút đọc",
    date: "02/05/2026",
    image: TRAVEL_IMAGE_URLS.landscape,
    href: "/guides",
  },
  {
    title: "Phú Quốc: bãi biển ít khách và resort phù hợp",
    excerpt: "So sánh khu Bắc – Nam đảo và gợi ý lưu trú theo ngân sách.",
    badge: "Điểm đến",
    readTime: "10 phút đọc",
    date: "28/04/2026",
    image: TRAVEL_IMAGE_URLS.beach,
    href: "/guides",
  },
  {
    title: "Chuẩn bị trekking Sapa — trang phục & thể lực",
    excerpt: "Checklist nhẹ gọn cho 2 ngày leo núi và thời tiết lành hơn theo tháng.",
    badge: "Kinh nghiệm",
    readTime: "6 phút đọc",
    date: "15/04/2026",
    image: TRAVEL_IMAGE_URLS.mountains,
    href: "/guides",
  },
];

function useCarouselScroll() {
  const ref = useRef<HTMLDivElement>(null);

  const go = useCallback((dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const gap = 16;
    const first = el.querySelector<HTMLElement>("[data-carousel-card]");
    const step = (first?.offsetWidth ?? 260) + gap;
    el.scrollBy({
      left: dir * Math.min(step * 2, el.clientWidth * 0.85),
      behavior: "smooth",
    });
  }, []);

  return { ref, go };
}

function CarouselNav({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Trước"
        className="inline-flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-2 border-white/40 bg-slate-900/85 text-white shadow-lg backdrop-blur-md transition hover:border-amber-300/60 hover:bg-slate-800 active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.25} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Sau"
        className="inline-flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-2 border-white/40 bg-slate-900/85 text-white shadow-lg backdrop-blur-md transition hover:border-amber-300/60 hover:bg-slate-800 active:scale-95"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  );
}

const Guide = () => {
  const tours = useCarouselScroll();
  const articles = useCarouselScroll();

  const sectionIntro = (label: string, title: React.ReactNode, desc: string, href: string, cta: string) => (
    <header className="max-w-[320px] shrink-0 space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/70">{label}</p>
      <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{title}</h2>
      <p className="text-sm leading-relaxed text-white/75">{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/20"
      >
        {cta}
      </Link>
    </header>
  );

  return (
    <section className="relative py-14 text-white sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/20 bg-slate-950/50 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:rounded-3xl lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            {sectionIntro(
              "Trải nghiệm nổi bật",
              <>
                Tour &amp; <span className="text-white/90">Trải nghiệm</span>
              </>,
              "Khám phá các hành trình được tuyển chọn đặc biệt cho bạn.",
              "/tours",
              "Xem tất cả tour",
            )}
            <div className="min-w-0 w-full max-w-full flex-1">
              <div className="mb-4 flex flex-row flex-wrap items-center justify-between gap-3 sm:justify-end">
                <CarouselNav onPrev={() => tours.go(-1)} onNext={() => tours.go(1)} />
              </div>
              <div
                ref={tours.ref}
                className="flex flex-row flex-nowrap gap-4 overflow-x-auto overscroll-x-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {TOURS.map((t) => (
                  <article
                    key={t.title}
                    data-carousel-card
                    className="group flex w-[min(280px,calc(100vw-3rem))] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900/40 shadow-xl backdrop-blur-md sm:w-[272px] lg:rounded-3xl"
                  >
                    <div className="relative aspect-[16/10] w-full min-h-[140px] shrink-0 overflow-hidden bg-slate-800">
                      <Image
                        src={t.image}
                        alt=""
                        fill
                        className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width:640px)90vw,272px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                      <span className="absolute right-2.5 top-2.5 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                        {t.badge}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div>
                        <h3 className="font-semibold leading-snug text-white">{t.title}</h3>
                        <p className="mt-1 text-[13px] text-white/70">{t.location}</p>
                      </div>
                      <div className="space-y-1.5 text-[13px] text-white/70">
                        <p className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden />
                          <span>{t.duration}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden />
                          <span>{t.categories}</span>
                        </p>
                      </div>
                      <p className="mt-auto pt-1 text-right font-semibold text-white">{t.price}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-slate-950/50 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:rounded-3xl lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            {sectionIntro(
              "Bài viết & hướng dẫn",
              <>
                Cẩm nang <span className="text-white/90">du lịch</span>
              </>,
              "Kinh nghiệm hữu ích cho hành trình của bạn.",
              "/guides",
              "Xem tất cả bài viết",
            )}
            <div className="min-w-0 w-full max-w-full flex-1">
              <div className="mb-4 flex flex-row flex-wrap items-center justify-between gap-3 sm:justify-end">
                <CarouselNav onPrev={() => articles.go(-1)} onNext={() => articles.go(1)} />
              </div>
              <div
                ref={articles.ref}
                className="flex flex-row flex-nowrap gap-4 overflow-x-auto overscroll-x-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {ARTICLES.map((a) => (
                  <Link
                    key={a.title}
                    href={a.href ?? "/guides"}
                    data-carousel-card
                    className="group flex w-[min(280px,calc(100vw-3rem))] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900/40 shadow-xl backdrop-blur-md transition hover:border-amber-400/35 sm:w-[272px] lg:rounded-3xl"
                  >
                    <div className="relative aspect-[16/10] w-full min-h-[140px] shrink-0 overflow-hidden bg-slate-800">
                      <Image
                        src={a.image}
                        alt=""
                        fill
                        className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width:640px)90vw,272px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                      <span className="absolute left-2.5 top-2.5 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                        {a.badge}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h3 className="font-semibold leading-snug text-white group-hover:text-white/95">{a.title}</h3>
                      <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-white/70">{a.excerpt}</p>
                      <div className="flex items-center justify-between border-t border-white/15 pt-3 text-[12px] text-white/60">
                        <span>{a.readTime}</span>
                        <span>{a.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guide;
