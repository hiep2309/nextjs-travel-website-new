"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { panelEnter } from "@/lib/planner/motionPresets";
import { requestTripPlan } from "@/lib/planner/requestTripPlan";
import { DEFAULT_FORM, type PlannerFormData, type TripPlan } from "@/lib/planner/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import PlannerForm from "./PlannerForm";
import PlannerLoading from "./PlannerLoading";
import TripResults from "./TripResults";

export default function AiTripPlannerClient() {
  const t = useTranslations("AiPlanner");
  const locale = useLocale() as AppLocale;
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<PlannerFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);

  useEffect(() => {
    if (!plan || !isMobile) return;
    const timer = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [plan, isMobile, reduceMotion]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    if (isMobile) {
      resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    try {
      const result = await requestTripPlan(form, locale);
      setPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] pb-20 pt-20 text-white sm:pt-24 sm:pb-16">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/signup_pic.jpg')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-slate-950/92 via-slate-950/88 to-slate-950/96"
        aria-hidden
      />

      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr] lg:items-start lg:gap-8">
          <PlannerForm
            value={form}
            onChange={setForm}
            onSubmit={() => void generate()}
            loading={loading}
          />

          <div ref={resultsRef} className="min-w-0 scroll-mt-24 lg:scroll-mt-28">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 rounded-2xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100"
                  role="alert"
                >
                  {error}
                  {error.includes("GEMINI_API_KEY") ? (
                    <p className="mt-2 text-xs text-red-200/80">{t("errorApiKey")}</p>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show", exit: "exit" })}>
                  <PlannerLoading />
                </motion.div>
              ) : plan ? (
                <motion.div key="plan" {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show" })}>
                  <TripResults plan={plan} form={form} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  {...(reduceMotion ? {} : { variants: panelEnter, initial: "hidden", animate: "show" })}
                  className="flex min-h-[min(360px,55dvh)] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center backdrop-blur-sm sm:min-h-[420px] sm:rounded-3xl sm:p-10"
                >
                  <p className="max-w-md text-base font-semibold text-white/80 sm:text-lg">{t("emptyTitle")}</p>
                  <p className="mt-2 max-w-sm text-sm text-white/50">{t("emptyDesc")}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
