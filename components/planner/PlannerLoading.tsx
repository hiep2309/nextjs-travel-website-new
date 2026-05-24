"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STEP_KEYS = ["step1", "step2", "step3"] as const;

type Props = {
  streamPreview?: string;
};

export default function PlannerLoading({ streamPreview }: Props) {
  const t = useTranslations("AiPlanner");
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % STEP_KEYS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[min(360px,55dvh)] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:min-h-[420px] sm:rounded-3xl sm:p-10">
      <motion.div
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/40 sm:mb-6 sm:h-16 sm:w-16 sm:rounded-2xl"
      >
        <Sparkles className="size-7 text-white sm:size-8" aria-hidden />
      </motion.div>
      <p className="text-center text-base font-semibold text-white sm:text-lg">{t("generating")}</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          className="mt-2 max-w-xs text-center text-sm text-white/60 sm:mt-3"
        >
          {t(STEP_KEYS[step])}
        </motion.p>
      </AnimatePresence>
      <div className="mt-6 flex gap-2 sm:mt-8">
        {STEP_KEYS.map((_, i) => (
          <motion.span
            key={i}
            animate={{
              scale: i === step ? 1.25 : 1,
              opacity: i === step ? 1 : 0.35,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="h-2 w-2 rounded-full bg-violet-400"
          />
        ))}
      </div>
      {streamPreview ? (
        <p className="mt-4 max-w-md truncate font-mono text-[10px] text-violet-300/70 sm:text-xs">
          {streamPreview}
        </p>
      ) : null}
    </div>
  );
}
