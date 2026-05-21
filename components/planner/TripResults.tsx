"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, Share2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { PlannerFormData, TripPlan } from "@/lib/planner/types";
import { easeOut } from "@/lib/planner/motionPresets";
import TripTimeline from "./TripTimeline";
import CostSummary from "./CostSummary";
import HiddenGems from "./HiddenGems";
import TripMap from "./TripMap";

const glass =
  "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl sm:rounded-3xl";

type TabId = "overview" | "map" | "cost" | number;

type Props = {
  plan: TripPlan;
  form: PlannerFormData;
};

export default function TripResults({ plan, form }: Props) {
  const t = useTranslations("AiPlanner");
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<TabId>("overview");
  const [saved, setSaved] = useState(false);
  const tabIndexRef = useRef(0);
  const [slideDir, setSlideDir] = useState(0);

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [
      { id: "overview", label: t("tabOverview") },
      ...plan.days.map((d) => ({ id: d.day as TabId, label: t("dayTab", { n: d.day }) })),
      { id: "map", label: t("tabMap") },
      { id: "cost", label: t("tabCost") },
    ];
    return list;
  }, [plan.days, t]);

  const travelStyleLabel = t(`style_${form.travelStyle}`);
  const transportLabel = t(`transport_${form.transportation}`);
  const paceLabel = t(`pace_${form.pace}`);

  const activeDay =
    typeof tab === "number" ? plan.days.find((d) => d.day === tab) : plan.days[0];

  const selectTab = (id: TabId) => {
    const nextIndex = tabs.findIndex((item) => item.id === id);
    if (nextIndex >= 0) {
      setSlideDir(nextIndex > tabIndexRef.current ? 1 : nextIndex < tabIndexRef.current ? -1 : 0);
      tabIndexRef.current = nextIndex;
    }
    setTab(id);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        "vninsight_saved_trip",
        JSON.stringify({ plan, form, savedAt: Date.now() }),
      );
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    const text = `${plan.trip_title}\n${plan.destination}\n${plan.total_estimated_cost}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: plan.trip_title, text });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert(t("copied"));
    } catch {
      /* ignore */
    }
  };

  const tabMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: slideDir * 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: slideDir * -12 },
        transition: { duration: 0.28, ease: easeOut },
      };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`${glass} p-4 sm:p-6 lg:p-7`}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between sm:pb-5">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("resultsTitle")}</h2>
          <p className="mt-1 line-clamp-2 text-xs text-white/55 sm:text-sm">
            {plan.trip_title} · {form.days} {t("daysShort")} · {travelStyleLabel} · {transportLabel} ·{" "}
            {paceLabel} · {form.travelers} {t("people")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="touch-manipulation inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-white/10 sm:px-4"
          >
            <Bookmark className={`size-4 shrink-0 ${saved ? "fill-violet-300" : ""}`} />
            <span className="truncate">{saved ? t("saved") : t("save")}</span>
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="touch-manipulation inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-white/10 sm:px-4"
          >
            <Share2 className="size-4 shrink-0" />
            {t("share")}
          </button>
        </div>
      </div>

      <div
        className="hide-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2 pt-1 snap-x snap-mandatory touch-pan-x sm:mt-4"
        role="tablist"
        aria-label={t("resultsTitle")}
      >
        {tabs.map((item) => (
          <button
            key={String(item.id)}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => selectTab(item.id)}
            className={`relative shrink-0 snap-start rounded-full px-3.5 py-2.5 text-xs font-semibold transition touch-manipulation sm:px-4 sm:text-sm ${
              tab === item.id
                ? "text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab === item.id ? (
              <motion.span
                layoutId="planner-tab-pill"
                className="absolute inset-0 rounded-full bg-violet-600/50 ring-1 ring-violet-400/50"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10 whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={slideDir}>
        <motion.div key={String(tab)} {...tabMotion} className="mt-4 sm:mt-6">
          {tab === "overview" && (
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
              <div className="order-2 space-y-5 lg:order-1 lg:space-y-6">
                <div className="overflow-hidden rounded-xl border border-white/10 sm:rounded-2xl">
                  <div className="relative aspect-[16/10] min-h-[120px] sm:aspect-[21/9] sm:min-h-[140px]">
                    <Image
                      src="/signup_pic.jpg"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 60vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                      <p className="text-[10px] uppercase tracking-wider text-white/70 sm:text-xs">
                        {plan.destination}
                      </p>
                      <h3 className="line-clamp-2 text-base font-bold text-white sm:text-lg">{plan.trip_title}</h3>
                    </div>
                  </div>
                </div>
                {plan.days[0] ? (
                  <TripTimeline day={plan.days[0]} animateKey={`overview-${plan.days[0].day}`} />
                ) : null}
                {plan.days[1] ? (
                  <button
                    type="button"
                    onClick={() => selectTab(2)}
                    className="touch-manipulation text-sm font-semibold text-violet-300 active:text-violet-200 hover:text-violet-200"
                  >
                    {t("viewDay", { n: 2 })} →
                  </button>
                ) : null}
              </div>
              <div className="order-1 space-y-4 lg:order-2">
                <CostSummary plan={plan} budgetRaw={form.budget} />
                <div className="hidden sm:block">
                  <TripMap days={plan.days} activeDay={plan.days[0]?.day} />
                </div>
                <HiddenGems gems={plan.hidden_gems} limit={2} />
              </div>
            </div>
          )}

          {typeof tab === "number" && activeDay ? (
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
              <TripTimeline day={activeDay} animateKey={`day-${tab}`} />
              <TripMap days={plan.days} activeDay={tab} />
            </div>
          ) : null}

          {tab === "map" && <TripMap days={plan.days} />}
          {tab === "cost" && <CostSummary plan={plan} budgetRaw={form.budget} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
