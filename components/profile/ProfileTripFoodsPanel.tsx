"use client";

import { Loader2, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ContentCardOverlay } from "@/components/cards";
import { useTripFoods } from "@/hooks/useTripFoods";

const glass = "rounded-2xl border border-white/15 bg-white/[0.06] shadow-xl backdrop-blur-xl";

type Props = {
  userId: string;
};

export default function ProfileTripFoodsPanel({ userId }: Props) {
  const tProfile = useTranslations("Profile");
  const tSaved = useTranslations("SavedFoods");
  const { items, loading } = useTripFoods(userId);

  if (loading) {
    return (
      <div className="mt-8 flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-violet-300" aria-hidden />
        <span className="sr-only">{tProfile("loading")}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${glass} mt-6 flex flex-col items-center justify-center px-6 py-16 text-center`}>
        <UtensilsCrossed className="size-10 text-violet-300/50" aria-hidden />
        <p className="mt-4 text-sm font-medium text-white/75">{tSaved("emptyTrip")}</p>
        <p className="mt-2 max-w-sm text-xs text-white/45">{tSaved("emptyTripHint")}</p>
        <Link
          href="/ai-food-explorer"
          className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white"
        >
          {tSaved("exploreMore")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-white/55">{tProfile("tripFoodsDesc")}</p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((food) => (
          <ContentCardOverlay
            key={food.id}
            href="/ai-food-explorer"
            title={food.name}
            image={food.image}
            chip={tProfile("chipFood")}
            sub={food.city}
          />
        ))}
      </div>
      <Link
        href="/ai-trip-planner"
        className="mt-6 inline-flex rounded-xl border border-violet-400/30 bg-violet-600/20 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-600/30"
      >
        {tSaved("openPlanner")} →
      </Link>
    </div>
  );
}
