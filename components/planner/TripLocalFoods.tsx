"use client";

import { UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  foods: string[];
};

export default function TripLocalFoods({ foods }: Props) {
  const t = useTranslations("SavedFoods");

  if (!foods.length) return null;

  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 backdrop-blur-xl">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200">
        <UtensilsCrossed className="size-4" aria-hidden />
        {t("itineraryFoodTitle")}
      </p>
      <ul className="mt-3 space-y-1.5">
        {foods.map((name) => (
          <li key={name} className="text-sm font-medium text-white/85">
            · {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
