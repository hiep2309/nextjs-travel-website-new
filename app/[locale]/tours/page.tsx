/**
 * Trang Tours — danh sách tour mẫu (dữ liệu tĩnh `MOCK_TOURS`), lọc theo miền/chủ đề.
 *
 * Không gọi API; dùng để demo UI và CTA.
 */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { CommunityTourCard } from "./CommunityTourCard";
import { Clock, MapPinned, Star, ChevronRight } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MOCK_TOURS, filterToursByChip, type TourChipKey, type TourRecord } from "@/lib/toursContent";
import { postBelongsToSection } from "@/lib/postCategories";
import type { TravelPost } from "@/lib/travelPost";

export default function ToursPage() {
  const t = useTranslations("Tours");
  const tn = useTranslations("Nav");
  const tc = useTranslations("Common");

  const CHIPS: { key: TourChipKey; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "north", label: t("filterNorth") },
    { key: "central", label: t("filterCentral") },
    { key: "south", label: t("filterSouth") },
    { key: "day", label: t("filterDay") },
    { key: "long", label: t("filterLong") },
  ];

  const [chip, setChip] = useState<TourChipKey>("all");
  const [community, setCommunity] = useState<TravelPost[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const filtered = useMemo(() => filterToursByChip(MOCK_TOURS, chip), [chip]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const q = query(collection(db, "posts"), where("status", "==", "approved"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TravelPost[];
        const tours = data
          .filter((p) => postBelongsToSection(p, "tours"))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        if (alive) setCommunity(tours);
      } catch {
        if (alive) setCommunity([]);
      } finally {
        if (alive) setLoadingCommunity(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen pb-16 pt-28 text-white">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-[#8892a8]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-400">
            {tn("home")}
          </Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">{tn("tours")}</span>
        </nav>
        <header className="mx-auto mt-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("pageTitle")}</h1>
          <p className="mt-3 text-sm text-[#9aa5bc] sm:text-base">{t("desc")}</p>
        </header>

        <section className="mt-12">
          <h2 className="text-lg font-bold text-amber-200">{t("community")}</h2>
          {loadingCommunity ? (
            <p className="mt-4 text-sm text-[#8892a8]">{tc("loading")}</p>
          ) : community.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-white/10 py-10 text-center text-sm text-[#9aa5bc]">
              {t("empty")}
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {community.map((p) => (
                <CommunityTourCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </section>

        <h2 className="mt-14 text-lg font-bold text-white/90">{t("suggested")}</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
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
          {filtered.map((tour) => (
            <TourRow key={tour.id} tour={tour} />
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-white/10 py-14 text-center text-[#9aa5bc]">{t("emptyFilter")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TourRow({ tour }: { tour: TourRecord }) {
  const t = useTranslations("Tours");
  const dur =
    tour.nights === 0
      ? t("dayTrip", { days: tour.days })
      : t("daysNights", { days: tour.days, nights: tour.nights });
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
