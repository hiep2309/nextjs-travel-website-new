"use client";

import Image from "next/image";
import { Heart, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { useFoodActions } from "@/hooks/useFoodActions";
import { useSavedFoods } from "@/hooks/useSavedFoods";
import { getDishById } from "@/lib/food/dishes";
import { buildFoodMapsUrl } from "@/lib/food/dishSnapshot";
import { moveSavedFoodToTrip } from "@/lib/food/userFoodService";
import { trackFoodEvent } from "@/lib/food/foodAnalytics";
import FoodToast from "@/components/food/FoodToast";
import type { SavedFoodRecord } from "@/lib/food/userFoodTypes";

const glass = "rounded-2xl border border-white/15 bg-white/[0.06] shadow-xl backdrop-blur-xl";

export default function SavedFoodsClient() {
  const t = useTranslations("SavedFoods");
  const tCat = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const { user } = useAuth();
  const { items, loading, remove } = useSavedFoods(user?.uid);
  const { toast, dismissToast, addToTrip, isInTrip } = useFoodActions();

  const handleAddToTrip = async (saved: SavedFoodRecord) => {
    if (!user) return;
    const dish = getDishById(saved.id);
    if (dish) {
      await addToTrip(dish);
      return;
    }
    const result = await moveSavedFoodToTrip(user.uid, saved);
    if (result === "added") {
      void trackFoodEvent(user.uid, "trip_add", { foodId: saved.id, foodName: saved.name });
    }
  };

  return (
    <div className="relative min-h-screen pb-16 pt-24 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">VN Insight</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t("savedTitle")}</h1>
        <p className="mt-2 text-sm text-white/55">{t("savedSubtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/profile"
            className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            {t("backProfile")}
          </Link>
          <Link
            href="/profile/trip-foods"
            className="rounded-xl border border-violet-400/30 bg-violet-600/20 px-3 py-2 text-sm font-semibold text-violet-100"
          >
            {t("viewTripFoods")}
          </Link>
          <Link
            href="/ai-food-explorer"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2 text-sm font-bold text-white"
          >
            {t("exploreMore")}
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="size-8 animate-spin text-violet-300" aria-hidden />
          </div>
        ) : items.length === 0 ? (
          <div className={`${glass} mt-10 p-10 text-center`}>
            <Heart className="mx-auto size-10 text-pink-300/60" aria-hidden />
            <p className="mt-4 font-semibold text-white">{t("emptySaved")}</p>
            <p className="mt-2 text-sm text-white/50">{t("emptySavedHint")}</p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((food) => {
              const dish = getDishById(food.id);
              const mapsUrl = dish ? buildFoodMapsUrl(dish, locale) : undefined;
              const inTrip = isInTrip(food.id);

              return (
                <li key={food.id} className={`${glass} overflow-hidden`}>
                  <div className="relative h-40 w-full">
                    <Image src={food.image} alt={food.name} fill className="object-cover" sizes="400px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816] to-transparent" />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-white">{food.name}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-white/60">
                      <MapPin className="size-3.5 text-violet-300" aria-hidden />
                      {food.city}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {t("categoryLabel")}: {tCat(`cat_${food.category}`)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void remove(food.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        {t("remove")}
                      </button>
                      <button
                        type="button"
                        disabled={inTrip}
                        onClick={() => void handleAddToTrip(food)}
                        className="inline-flex items-center gap-1 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-50"
                      >
                        <Plus className="size-3.5" aria-hidden />
                        {inTrip ? t("actionInTrip") : t("actionAddToTrip")}
                      </button>
                      {mapsUrl ? (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                        >
                          <MapPin className="size-3.5" aria-hidden />
                          {t("actionViewLocation")}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <FoodToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
