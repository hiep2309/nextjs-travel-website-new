"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Share2, Sparkles, Trash2 } from "lucide-react";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { Link, useRouter } from "@/i18n/navigation";
import CostSummary from "@/components/planner/CostSummary";
import HiddenGems from "@/components/planner/HiddenGems";
import TripMap from "@/components/planner/TripMap";
import TripTimeline from "@/components/planner/TripTimeline";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedTripPlan } from "@/hooks/useLocalizedTripPlan";
import { deleteItinerary } from "@/lib/itinerary/deleteItinerary";
import {
  formatItineraryDate,
  getItineraryDestination,
  getItinerarySummary,
  getItineraryTitle,
} from "@/lib/itinerary/display";
import { getItineraryById } from "@/lib/itinerary/getItineraries";
import type { SavedItineraryRecord } from "@/lib/itinerary/types";
import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  id: string;
};

export default function SavedItineraryDetailClient({ id }: Props) {
  const t = useTranslations("SavedItineraries");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<SavedItineraryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sourceLocale = (item?.locale ?? item?.form.locale ?? "vi") as AppLocale;
  const { plan: displayPlan, localizing } = useLocalizedTripPlan(item?.plan ?? null, sourceLocale);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const row = await getItineraryById(user.uid, id);
        if (cancelled) return;
        if (!row) {
          setError(t("notFound"));
          setItem(null);
        } else {
          setItem(row);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, id, t]);

  const handleDelete = async () => {
    if (!user?.uid || !item) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    await deleteItinerary(user.uid, item.id);
    router.push("/saved-itineraries");
  };

  const handleShare = async () => {
    if (!item) return;
    const sharePlan = displayPlan ?? item.plan;
    const title = sharePlan.trip_title || getItineraryTitle(item, locale);
    const text = `${title}\n${sharePlan.total_estimated_cost}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <Skeleton className="aspect-[21/9] w-full rounded-3xl" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-32 pb-16 text-center">
        <p className="text-white/70">{error ?? t("notFound")}</p>
        <Link
          href="/saved-itineraries"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-300"
        >
          <ArrowLeft className="size-4" /> {t("backToList")}
        </Link>
      </div>
    );
  }

  const title = displayPlan?.trip_title || getItineraryTitle(item, locale);
  const destination = displayPlan?.destination || getItineraryDestination(item, locale);
  const summary =
    displayPlan?.days[0]?.activities[0]?.description?.slice(0, 160) ||
    displayPlan?.days[0]?.theme ||
    displayPlan?.trip_title ||
    getItinerarySummary(item, locale);
  const plan = displayPlan ?? item.plan;

  return (
    <div className="relative min-h-[100dvh] pb-20 pt-20 text-white sm:pt-24">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <Link
          href="/saved-itineraries"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="size-4" /> {t("backToList")}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl"
          style={localizing ? { opacity: 0.85 } : undefined}
        >
          <div className="relative aspect-[21/9] min-h-[180px]">
            <FlexibleImage src={item.coverImage} alt="" className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/40 px-2.5 py-1 text-[10px] font-bold uppercase text-violet-100 ring-1 ring-violet-400/40">
                <Sparkles className="size-3" /> AI
              </span>
              <p className="mt-2 text-sm text-white/70">{destination}</p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/60">{summary}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
            <p className="text-xs text-white/45">
              {t("createdAt", { date: formatItineraryDate(item.createdAt, locale) })}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/ai-trip-planner?itinerary=${item.id}`}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 text-xs font-bold text-white"
              >
                <Pencil className="size-3.5" /> {t("continue")}
              </Link>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white"
              >
                <Share2 className="size-3.5" /> {t("share")}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 text-xs font-semibold text-red-200"
              >
                <Trash2 className="size-3.5" /> {t("delete")}
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              {plan.days.map((day) => (
                <TripTimeline key={day.day} day={day} animateKey={`saved-${day.day}`} />
              ))}
            </div>
            <div className="space-y-4">
              <CostSummary plan={plan} budgetRaw={item.budget} />
              <TripMap days={plan.days} />
              <HiddenGems gems={plan.hidden_gems} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
