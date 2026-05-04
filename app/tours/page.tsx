"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, MapPinned, Star, ChevronRight } from "lucide-react";
import { MOCK_TOURS, filterToursByChip, type TourChipKey, type TourRecord } from "@/lib/toursContent";

const CHIPS: { key: TourChipKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "north", label: "Miền Bắc" },
  { key: "central", label: "Miền Trung" },
  { key: "south", label: "Miền Nam" },
  { key: "day", label: "Trong ngày" },
  { key: "long", label: "Dài ngày" },
];

export default function ToursPage() {
  const [chip, setChip] = useState<TourChipKey>("all");
  const filtered = useMemo(() => filterToursByChip(MOCK_TOURS, chip), [chip]);

  return (
    <div className="min-h-screen bg-[#0b1121] pb-16 pt-28 text-white">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-[#8892a8]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-400">
            Home
          </Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">Tours</span>
        </nav>
        <header className="mx-auto mt-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Lịch trình tour</h1>
          <p className="mt-3 text-sm text-[#9aa5bc] sm:text-base">
            Gợi ý tuyến — ảnh và giá minh họa. Liên hệ đơn vị lữ hành để đặt chỗ.
          </p>
        </header>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setChip(c.key)}
              aria-pressed={chip === c.key}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                chip === c.key
                  ? "bg-amber-500 text-[#0b1121]"
                  : "border border-white/15 bg-[#141b2e] text-[#cad3e2] hover:border-amber-500/35"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-12 space-y-6">
          {filtered.map((t) => (
            <TourRow key={t.id} tour={t} />
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-white/10 py-14 text-center text-[#9aa5bc]">Chưa có tour phù hợp.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TourRow({ tour }: { tour: TourRecord }) {
  const dur =
    tour.nights === 0 ? `${tour.days} ngày (trong ngày)` : `${tour.days} ngày ${tour.nights} đêm`;
  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141b2e]/90 shadow-xl">
      <div className="flex flex-col md:flex-row">
        <div className="relative aspect-[16/10] shrink-0 md:aspect-auto md:h-auto md:w-[min(320px,38%)]">
          <Image src={tour.image} alt="" fill className="object-cover" sizes="320px" />
          {tour.featured ? (
            <span className="absolute left-3 top-3 rounded-md border border-amber-500/50 bg-black/60 px-2 py-1 text-[10px] font-bold uppercase text-amber-300">
              Nổi bật
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{tour.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#9aa5bc]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                {dur}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPinned className="h-4 w-4 text-amber-500" />
                {tour.route}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-amber-200">{tour.rating}</span>
              <span className="text-xs text-[#7c879c]">({tour.reviewCount} nhận xét)</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-[#b4bfce]">{tour.description}</p>
          </div>
          <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-xl font-bold text-amber-400">{tour.priceLabel}</p>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/70 px-5 py-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/10"
            >
              Xem bài viết địa điểm
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
