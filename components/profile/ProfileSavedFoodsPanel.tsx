"use client";

import { useMemo } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Timestamp } from "firebase/firestore";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { ContentCardOverlay } from "@/components/cards";
import { useSavedFoods } from "@/hooks/useSavedFoods";
import type { SavedFoodRecord } from "@/lib/food/userFoodTypes";

const glass = "rounded-2xl border border-white/15 bg-white/[0.06] shadow-xl backdrop-blur-xl";

function savedAtMs(savedAt: SavedFoodRecord["savedAt"]): number {
  if (!savedAt) return 0;
  if (typeof savedAt === "string") return Date.parse(savedAt) || 0;
  if (typeof savedAt === "object" && "toMillis" in savedAt) {
    return (savedAt as Timestamp).toMillis();
  }
  if (typeof savedAt === "object" && "seconds" in savedAt) {
    return (savedAt as { seconds: number }).seconds * 1000;
  }
  return 0;
}

type ProfileT = ReturnType<typeof useTranslations<"Profile">>;

function formatRelativeTime(ts: number, t: ProfileT, locale: AppLocale): string {
  if (!ts) return "";
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 45) return t("justNow");
  const min = Math.floor(sec / 60);
  if (min < 60) return t("minutesAgo", { count: min });
  const h = Math.floor(min / 60);
  if (h < 24) return t("hoursAgo", { count: h });
  const d = Math.floor(h / 24);
  if (d < 7) return t("daysAgo", { count: d });
  const localeTag = locale === "vi" ? "vi-VN" : locale === "ko" ? "ko-KR" : "en-US";
  return new Date(ts).toLocaleDateString(localeTag);
}

type Props = {
  userId: string;
};

export default function ProfileSavedFoodsPanel({ userId }: Props) {
  const tProfile = useTranslations("Profile");
  const tSaved = useTranslations("SavedFoods");
  const tCat = useTranslations("FoodExplorer");
  const locale = useLocale() as AppLocale;
  const { items, loading } = useSavedFoods(userId);

  const sorted = useMemo(
    () => [...items].sort((a, b) => savedAtMs(b.savedAt) - savedAtMs(a.savedAt)),
    [items],
  );

  if (loading) {
    return (
      <div className="mt-8 flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-violet-300" aria-hidden />
        <span className="sr-only">{tProfile("loading")}</span>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className={`${glass} mt-6 flex flex-col items-center justify-center px-6 py-16 text-center`}>
        <Heart className="size-10 text-pink-300/50" aria-hidden />
        <p className="mt-4 text-sm font-medium text-white/75">{tSaved("emptySaved")}</p>
        <p className="mt-2 max-w-sm text-xs text-white/45">{tSaved("emptySavedHint")}</p>
        <Link
          href="/ai-food-explorer"
          className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:from-violet-500 hover:to-blue-500"
        >
          {tSaved("exploreMore")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-white/55">{tProfile("savedFoodsDesc")}</p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((food) => {
          const at = savedAtMs(food.savedAt);
          const sub = at
            ? tProfile("subSavedAt", { time: formatRelativeTime(at, tProfile, locale) })
            : food.city;
          return (
            <ContentCardOverlay
              key={food.id}
              href="/ai-food-explorer"
              title={food.name}
              image={food.image}
              chip={tCat(`cat_${food.category}`)}
              sub={at ? `${food.city} · ${sub}` : food.city}
              showSavedIcon
            />
          );
        })}
      </div>
    </div>
  );
}
