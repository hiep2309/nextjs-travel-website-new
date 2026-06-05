"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { auth } from "@/lib/firebase";
import { getDefaultPlannerForm } from "@/lib/planner/i18n";
import { getItineraryById } from "@/lib/itinerary/getItineraries";
import { panelEnter } from "@/lib/planner/motionPresets";
import { GENERATE_DEBOUNCE_MS } from "@/lib/planner/plannerConfig";
import {
  PlannerError,
  requestTripPlan,
  type PlannerErrorCode,
} from "@/lib/planner/requestTripPlan";
import type { PlannerFormData, TripPlan, TripPlanMeta } from "@/lib/planner/types";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PUBLIC_HEROES } from "@/lib/publicAssets";
import { usePlannerCooldown } from "@/hooks/usePlannerCooldown";
import { formatPlannerBudget, type PlannerTemplate } from "@/lib/planner/templates";
import PlannerAuthGate from "./PlannerAuthGate";
import PlannerForm from "./PlannerForm";
import PlannerFallbackBanner from "./PlannerFallbackBanner";
import PlannerLoading from "./PlannerLoading";
import PlannerTemplates from "./PlannerTemplates";
import TripFoodPreferences from "./TripFoodPreferences";
import TripResults from "./TripResults";

type UsageInfo = {
  count: number;
  limit: number;
  remaining: number;
};

function resolveErrorMessage(
  code: PlannerErrorCode | null,
  fallback: string,
  t: ReturnType<typeof useTranslations<"AiPlanner">>,
): string {
  switch (code) {
    case "PARSE_FAILED":
      return t("errorParse");
    case "INVALID_PLAN":
      return t("errorInvalidPlan");
    case "TRUNCATED":
      return t("errorTruncated");
    case "QUOTA":
      return t("errorQuota");
    case "BLOCKED":
      return t("errorBlocked");
    case "DAILY_LIMIT":
      return t("errorDailyLimit");
    case "UNAUTHORIZED":
      return t("errorUnauthorized");
    case "API_KEY":
      return fallback;
    default:
      return fallback || t("errorGeneric");
  }
}

export default function AiTripPlannerClient() {
  const t = useTranslations("AiPlanner");
  const locale = useLocale() as AppLocale;
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastGenerateRef = useRef(0);
  const [form, setForm] = useState<PlannerFormData>(() => getDefaultPlannerForm(locale));
  const [loading, setLoading] = useState(false);
  const [streamPreview, setStreamPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<PlannerErrorCode | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [planSourceLocale, setPlanSourceLocale] = useState<AppLocale>(locale);
  const { isCoolingDown, remainingSec, startCooldown } = usePlannerCooldown();
  const [planMeta, setPlanMeta] = useState<TripPlanMeta | null>(null);
  const [loadedItineraryId, setLoadedItineraryId] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  const refreshUsage = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/ai-trip", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { usage?: UsageInfo };
      if (data.usage) setUsage(data.usage);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, locale }));
  }, [locale]);

  useEffect(() => {
    if (user) void refreshUsage();
  }, [user, refreshUsage]);

  useEffect(() => {
    const itineraryId = searchParams.get("itinerary");
    if (!itineraryId || !user?.uid) return;
    let cancelled = false;
    void (async () => {
      try {
        const row = await getItineraryById(user.uid, itineraryId);
        if (cancelled || !row) return;
        setForm(row.form);
        setPlan(row.plan);
        setPlanSourceLocale(row.locale ?? row.form.locale ?? "vi");
        setLoadedItineraryId(row.id);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, user?.uid]);

  useEffect(() => {
    if (!plan || !isMobile) return;
    const timer = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [plan, isMobile, reduceMotion]);

  const generate = async () => {
    if (!user || isCoolingDown || loading) return;

    const now = Date.now();
    if (now - lastGenerateRef.current < GENERATE_DEBOUNCE_MS) return;
    lastGenerateRef.current = now;

    setLoading(true);
    setError(null);
    setErrorCode(null);
    setPlan(null);
    setPlanMeta(null);
    setStreamPreview("");

    if (isMobile) {
      resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    try {
      const result = await requestTripPlan(form, locale, {
        onStatus: (phase) => {
          if (phase === "cache_hit") setStreamPreview(t("streamCacheHit"));
        },
        onToken: (text) => {
          setStreamPreview((prev) => (prev + text).slice(-120));
        },
      });

      setPlan(result.plan);
      setPlanSourceLocale(locale);
      setPlanMeta(result.meta);
      if (result.meta.usage) setUsage(result.meta.usage);

      if (result.meta.source === "fallback" && result.meta.fallbackReason === "quota") {
        startCooldown();
      }

      void refreshUsage();
    } catch (err) {
      const code = err instanceof PlannerError ? err.code : null;
      const fallback = err instanceof Error ? err.message : t("errorGeneric");
      setErrorCode(code);
      setError(resolveErrorMessage(code, fallback, t));
      if (code === "QUOTA") startCooldown();
      void refreshUsage();
    } finally {
      setLoading(false);
      setStreamPreview("");
    }
  };

  const applyTemplate = useCallback(
    (tpl: PlannerTemplate) => {
      setForm((prev) => ({
        ...prev,
        destination: tpl.destination[locale] ?? tpl.destination.vi,
        days: tpl.days,
        travelStyle: tpl.travelStyle,
        budget: formatPlannerBudget(tpl.budgetVnd, locale),
      }));
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    },
    [locale, isMobile, reduceMotion],
  );

  const submitDisabled = loading || isCoolingDown;

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16 text-white">
        <Loader2 className="size-8 animate-spin text-violet-400" aria-hidden />
        <span className="sr-only">{t("authChecking")}</span>
      </div>
    );
  }

  if (!user) {
    return <PlannerAuthGate />;
  }

  return (
    <div className="relative pb-20 pt-20 text-white sm:pt-24 sm:pb-16">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('${PUBLIC_HEROES.appBackground}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-950/92 via-slate-950/88 to-slate-950/96"
        aria-hidden
      />

      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr] lg:items-start lg:gap-8">
          <div className="space-y-4">
            <PlannerForm
              value={form}
              onChange={setForm}
              onSubmit={() => void generate()}
              loading={submitDisabled}
              usage={usage}
            />
            <TripFoodPreferences />
          </div>

          <div ref={resultsRef} className="min-w-0 scroll-mt-24 lg:scroll-mt-28">
            {planMeta ? (
              <PlannerFallbackBanner
                meta={planMeta}
                loading={loading}
                isCoolingDown={isCoolingDown}
                remainingSec={remainingSec}
                onRetry={() => void generate()}
              />
            ) : null}
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 overflow-hidden rounded-2xl border border-red-500/35 bg-gradient-to-br from-red-950/70 via-red-950/50 to-slate-950/80 p-4 shadow-xl shadow-red-950/30 backdrop-blur-md sm:p-5"
                  role="alert"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 ring-1 ring-red-400/30">
                      <Sparkles className="size-4 text-red-200" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-red-50">{error}</p>
                      {errorCode === "API_KEY" || error.includes("GEMINI_API_KEY") ? (
                        <p className="mt-2 text-xs leading-relaxed text-red-200/80">{t("errorApiKey")}</p>
                      ) : errorCode === "DAILY_LIMIT" ? (
                        <p className="mt-2 text-xs leading-relaxed text-red-200/80">{t("dailyLimitHint")}</p>
                      ) : (
                        <p className="mt-1.5 text-xs text-red-200/70">{t("errorParseHint")}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => void generate()}
                        disabled={submitDisabled}
                        className="touch-manipulation mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-50 transition hover:bg-red-500/25 active:scale-[0.98] disabled:opacity-60"
                      >
                        <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
                        {isCoolingDown ? t("retryIn", { seconds: remainingSec }) : t("errorRetry")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show", exit: "exit" })}
                >
                  <PlannerLoading streamPreview={streamPreview} />
                </motion.div>
              ) : plan ? (
                <motion.div
                  key="plan"
                  {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show" })}
                >
                  <TripResults
                    plan={plan}
                    form={form}
                    planSourceLocale={planSourceLocale}
                    planMeta={planMeta}
                    savedItineraryId={loadedItineraryId}
                    onSaved={setLoadedItineraryId}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show" })}
                >
                  <PlannerTemplates onApply={applyTemplate} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
