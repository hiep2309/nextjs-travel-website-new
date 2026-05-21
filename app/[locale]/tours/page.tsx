/**
 * Trang Tours — chỉ bài `tour_share` đã duyệt từ cộng đồng, sắp xếp theo lượt xem rồi ngày đăng.
 */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { filterTourSharePosts, sortPostsByViewsThenDate } from "@/lib/posts/sortPosts";
import { normalizeTravelPost } from "@/lib/firestore/multilingual";
import type { TravelPost } from "@/lib/travelPost";
import { CommunityTourCard } from "./CommunityTourCard";

export default function ToursPage() {
  const t = useTranslations("Tours");
  const tn = useTranslations("Nav");
  const tc = useTranslations("Common");
  const [community, setCommunity] = useState<TravelPost[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const q = query(collection(db, "posts"), where("status", "==", "approved"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => normalizeTravelPost(d.id, d.data() as Record<string, unknown>));
        const tours = sortPostsByViewsThenDate(filterTourSharePosts(data));
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
      </div>
    </div>
  );
}
