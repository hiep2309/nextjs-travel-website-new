"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, Check, Share2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import AuthPromptModal from "@/components/itinerary/AuthPromptModal";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedTripPlan } from "@/hooks/useLocalizedTripPlan";
import { saveItinerary, updateItineraryPlan } from "@/lib/itinerary/saveItinerary";
import type { PlannerFormData, TripPlan, TripPlanMeta } from "@/lib/planner/types";
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
  planSourceLocale?: AppLocale;
  planMeta?: TripPlanMeta | null;
  savedItineraryId?: string | null;
  onSaved?: (id: string) => void;
};

export default function TripResults({
  plan,
  form,
  planSourceLocale,
  planMeta,
  savedItineraryId,
  onSaved,
}: Props) {
  const t = useTranslations("AiPlanner");
  const locale = useLocale() as AppLocale;
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<TabId>("overview");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(savedItineraryId ?? null);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);
  const sourceLocale = planSourceLocale ?? form.locale ?? "vi";
  const { plan: viewPlan, localizing } = useLocalizedTripPlan(plan, sourceLocale);

  useEffect(() => {
    if (savedItineraryId) setSavedId(savedItineraryId);
  }, [savedItineraryId]);
  const tabIndexRef = useRef(0);
  const [slideDir, setSlideDir] = useState(0);

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [
      { id: "overview", label: t("tabOverview") },
      ...(viewPlan?.days ?? plan.days).map((d) => ({ id: d.day as TabId, label: t("dayTab", { n: d.day }) })),
      { id: "map", label: t("tabMap") },
      { id: "cost", label: t("tabCost") },
    ];
    return list;
  }, [plan.days, viewPlan?.days, t]);

  const travelStyleLabel = t(`style_${form.travelStyle}`);
  const transportLabel = t(`transport_${form.transportation}`);
  const paceLabel = t(`pace_${form.pace}`);

  const days = viewPlan?.days ?? plan.days;
  const activeDay = typeof tab === "number" ? days.find((d) => d.day === tab) : days[0];

  const selectTab = (id: TabId) => {
    const nextIndex = tabs.findIndex((item) => item.id === id);
    if (nextIndex >= 0) {
      setSlideDir(nextIndex > tabIndexRef.current ? 1 : nextIndex < tabIndexRef.current ? -1 : 0);
      tabIndexRef.current = nextIndex;
    }
    setTab(id);
  };

  const handleSave = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setSaving(true);
    setToastError(false);
    try {
      let id = savedId ?? savedItineraryId ?? null;
      if (id) {
        await updateItineraryPlan(id, user.uid, plan, form, locale);
        setSavedId(id);
      } else {
        id = await saveItinerary(user.uid, plan, form, locale);
        setSavedId(id);
        onSaved?.(id);
      }
      setSaved(true);
      setToast(t("saveSuccess"));
      window.setTimeout(() => {
        setSaved(false);
        setToast(null);
      }, 3500);
    } catch (err) {
      console.error("[TripResults] save failed", err);
      const detail =
        err instanceof FirebaseError && err.code === "permission-denied"
          ? t("saveErrorPermission")
          : t("saveError");
      setToastError(true);
      setToast(detail);
      window.setTimeout(() => {
        setToast(null);
        setToastError(false);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const sharePlan = viewPlan ?? plan;
    const text = `${sharePlan.trip_title}\n${sharePlan.destination}\n${sharePlan.total_estimated_cost}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: sharePlan.trip_title, text });
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
    <>
      <AuthPromptModal open={showAuth} onClose={() => setShowAuth(false)} />
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm backdrop-blur-md ${
              toastError
                ? "border-red-400/30 bg-red-950/50 text-red-50"
                : "border-emerald-400/30 bg-emerald-950/50 text-emerald-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {!toastError ? <Check className="size-4 text-emerald-300" /> : null}
              {toast}
            </span>
            {savedId ? (
              <Link href={`/saved-itineraries/${savedId}`} className="shrink-0 font-semibold text-emerald-200 underline-offset-2 hover:underline">
                {t("viewSaved")}
              </Link>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`${glass} p-4 sm:p-6 lg:p-7 ${localizing ? "opacity-80" : ""}`}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between sm:pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("resultsTitle")}</h2>
            {planMeta?.source === "fallback" ? (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-100">
                {t("fallbackBadge")}
              </span>
            ) : null}
            {planMeta?.source === "cache" ? (
              <span className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-100">
                {t("cachedBadge")}
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-white/55 sm:text-sm">
            {(viewPlan ?? plan).trip_title} · {form.days} {t("daysShort")} · {travelStyleLabel} · {transportLabel} ·{" "}
            {paceLabel} · {form.travelers} {t("people")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="touch-manipulation inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-white/10 disabled:opacity-60 sm:px-4"
          >
            <Bookmark className={`size-4 shrink-0 ${saved || savedId ? "fill-violet-300" : ""}`} />
            <span className="truncate">
              {saving ? t("saving") : saved ? t("saved") : savedId ? t("updateSave") : t("save")}
            </span>
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
                        {(viewPlan ?? plan).destination}
                      </p>
                      <h3 className="line-clamp-2 text-base font-bold text-white sm:text-lg">
                        {(viewPlan ?? plan).trip_title}
                      </h3>
                    </div>
                  </div>
                </div>
                {days[0] ? (
                  <TripTimeline day={days[0]} animateKey={`overview-${days[0].day}`} />
                ) : null}
                {days[1] ? (
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
                <CostSummary plan={viewPlan ?? plan} budgetRaw={form.budget} />
                <div className="hidden sm:block">
                  <TripMap days={days} activeDay={days[0]?.day} />
                </div>
                <HiddenGems gems={(viewPlan ?? plan).hidden_gems} limit={2} />
              </div>
            </div>
          )}

          {typeof tab === "number" && activeDay ? (
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
              <TripTimeline day={activeDay} animateKey={`day-${tab}`} />
              <TripMap days={days} activeDay={tab} />
            </div>
          ) : null}

          {tab === "map" && <TripMap days={days} />}
          {tab === "cost" && <CostSummary plan={viewPlan ?? plan} budgetRaw={form.budget} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
    </>
  );
}
