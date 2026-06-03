"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const STEP_KEYS = ["loadingStep1", "loadingStep2", "loadingStep3"] as const;
const STEP_INTERVAL_MS = 650;

export default function FoodLoading() {
  const t = useTranslations("FoodExplorer");
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEP_KEYS.length - 1) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), STEP_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-3">
        <span className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/30">
          {!reduceMotion ? (
            <span className="absolute inset-0 animate-ping rounded-2xl bg-violet-500/40" />
          ) : null}
          <Sparkles className="relative size-5 text-white" aria-hidden />
        </span>
        <div>
          <p className="font-bold text-white">{t("loadingTitle")}</p>
          <p className="text-sm text-white/55">{t("loadingDesc")}</p>
        </div>
      </div>

      {/* Sequential AI status steps */}
      <ol className="mt-6 space-y-3" aria-live="polite">
        {STEP_KEYS.map((key, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={key} className="flex items-center gap-3">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done
                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                    : active
                      ? "border-violet-400/50 bg-violet-600/25 text-violet-200"
                      : "border-white/10 bg-white/5 text-white/30"
                }`}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden />
                ) : active && !reduceMotion ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${key}-${done ? "done" : active ? "active" : "idle"}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: done || active ? 1 : 0.4, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`text-sm ${
                    active ? "font-semibold text-white" : done ? "text-white/70" : "text-white/35"
                  }`}
                >
                  {t(key)}
                </motion.span>
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      {/* Skeleton preview of the upcoming result */}
      <div className="mt-6 space-y-4">
        <div className="h-48 w-full animate-pulse rounded-2xl bg-white/5" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>

      {!reduceMotion ? (
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            style={{ width: "50%" }}
          />
        </div>
      ) : null}
    </div>
  );
}
