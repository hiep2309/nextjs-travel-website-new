"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useTripFoods } from "@/hooks/useTripFoods";

const glass =
  "rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg backdrop-blur-xl";

export default function TripFoodPreferences() {
  const t = useTranslations("SavedFoods");
  const { user } = useAuth();
  const { items, loading } = useTripFoods(user?.uid);

  if (!user) return null;

  if (loading) {
    return (
      <div className={`${glass} flex items-center gap-2 p-4 text-sm text-white/60`}>
        <Loader2 className="size-4 animate-spin text-violet-300" aria-hidden />
        {t("tripFoodsLoading")}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${glass} p-4`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <UtensilsCrossed className="size-4 text-violet-300" aria-hidden />
          {t("plannerNoTripFoods")}
        </p>
        <p className="mt-1 text-xs text-white/50">{t("plannerNoTripFoodsHint")}</p>
        <Link
          href="/ai-food-explorer"
          className="mt-3 inline-flex text-xs font-bold text-violet-300 hover:text-violet-200"
        >
          {t("exploreMore")} →
        </Link>
      </div>
    );
  }

  return (
    <div className={`${glass} p-4`}>
      <p className="text-xs font-bold uppercase tracking-wider text-violet-200/90">
        {t("plannerTripFoodsTitle")}
      </p>
      <p className="mt-1 text-xs text-white/50">{t("plannerTripFoodsDesc")}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((food) => (
          <li
            key={food.id}
            className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-600/15 py-1 pl-1 pr-3 text-xs font-semibold text-white"
          >
            <span className="relative size-7 overflow-hidden rounded-full">
              <Image src={food.image} alt="" fill className="object-cover" sizes="28px" />
            </span>
            {food.name}
          </li>
        ))}
      </ul>
      <Link
        href="/profile/trip-foods"
        className="mt-3 inline-block text-xs font-semibold text-violet-300 hover:text-violet-200"
      >
        {t("manageTripFoods")} →
      </Link>
    </div>
  );
}
