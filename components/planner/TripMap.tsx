"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TripDay } from "@/lib/planner/types";

type Props = {
  days: TripDay[];
  activeDay?: number;
};

export default function TripMap({ days, activeDay }: Props) {
  const t = useTranslations("AiPlanner");
  const day = activeDay
    ? days.find((d) => d.day === activeDay) ?? days[0]
    : days[0];

  const stops = day?.activities ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <MapPin className="size-4 text-violet-300" aria-hidden />
          {t("mapTitle")}
          {day ? ` — ${t("dayLabel", { n: day.day })}` : ""}
        </h3>
      </div>
      <div
        className="relative min-h-[220px] bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950/80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.15), transparent 50%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.12), transparent 45%)",
        }}
      >
        <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
          <path
            d="M40 120 Q120 80 200 100 T360 90"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        </svg>
        {stops.map((stop, i) => {
          const left = 12 + ((i * 17) % 70);
          const top = 18 + ((i * 23) % 55);
          return (
            <div
              key={`${stop.place_name}-${i}`}
              className="absolute flex items-center gap-1"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-xs font-bold text-white shadow-lg">
                {i + 1}
              </span>
            </div>
          );
        })}
        <p className="absolute bottom-3 left-3 right-3 text-center text-[11px] text-white/40">
          {t("mapHint")}
        </p>
      </div>
      <ul className="custom-scrollbar max-h-40 space-y-1 overflow-y-auto border-t border-white/10 p-3 text-xs text-white/70">
        {stops.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold text-violet-300">{i + 1}.</span>
            <span className="truncate">{s.place_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
