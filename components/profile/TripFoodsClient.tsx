"use client";

import Image from "next/image";
import { Loader2, MapPin, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTripFoods } from "@/hooks/useTripFoods";

const glass = "rounded-2xl border border-white/15 bg-white/[0.06] shadow-xl backdrop-blur-xl";

export default function TripFoodsClient() {
  const t = useTranslations("SavedFoods");
  const { user } = useAuth();
  const { items, loading, remove } = useTripFoods(user?.uid);

  return (
    <div className="relative min-h-screen pb-16 pt-24 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">VN Insight</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t("tripTitle")}</h1>
        <p className="mt-2 text-sm text-white/55">{t("tripSubtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/profile"
            className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            {t("backProfile")}
          </Link>
          <Link
            href="/profile/saved-foods"
            className="rounded-xl border border-pink-400/30 bg-pink-500/15 px-3 py-2 text-sm font-semibold text-pink-100"
          >
            {t("viewSavedFoods")}
          </Link>
          <Link
            href="/ai-trip-planner"
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2 text-sm font-bold text-white"
          >
            <Sparkles className="size-4" aria-hidden />
            {t("openPlanner")}
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="size-8 animate-spin text-violet-300" aria-hidden />
          </div>
        ) : items.length === 0 ? (
          <div className={`${glass} mt-10 p-10 text-center`}>
            <UtensilsCrossed className="mx-auto size-10 text-violet-300/60" aria-hidden />
            <p className="mt-4 font-semibold text-white">{t("emptyTrip")}</p>
            <p className="mt-2 text-sm text-white/50">{t("emptyTripHint")}</p>
            <Link
              href="/ai-food-explorer"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              {t("exploreMore")}
            </Link>
          </div>
        ) : (
          <>
            <div className={`${glass} mt-8 p-4`}>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-200/80">
                {t("plannerInjectLabel")}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {items.map((f) => f.name).join(" · ")}
              </p>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((food) => (
                <li key={food.id} className={`${glass} overflow-hidden`}>
                  <div className="relative h-32 w-full">
                    <Image src={food.image} alt={food.name} fill className="object-cover" sizes="300px" />
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-white">{food.name}</h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/55">
                      <MapPin className="size-3 text-violet-300" aria-hidden />
                      {food.city}
                    </p>
                    <button
                      type="button"
                      onClick={() => void remove(food.id)}
                      className="mt-3 inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      {t("remove")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
