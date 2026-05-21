"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TripPlanMeta } from "@/lib/planner/types";

type Props = {
  meta: TripPlanMeta;
  loading: boolean;
  isCoolingDown: boolean;
  remainingSec: number;
  onRetry: () => void;
};

export default function PlannerFallbackBanner({
  meta,
  loading,
  isCoolingDown,
  remainingSec,
  onRetry,
}: Props) {
  const t = useTranslations("AiPlanner");

  if (meta.source === "ai" || meta.source === "cache") return null;

  const isQuota = meta.fallbackReason === "quota";
  const title = isQuota ? t("fallbackQuotaTitle") : t("fallbackGenericTitle");
  const desc = isQuota ? t("fallbackQuotaDesc") : t("fallbackGenericDesc");

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-950/60 via-amber-950/40 to-slate-950/70 p-4 shadow-xl shadow-amber-950/20 backdrop-blur-md sm:p-5"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 ring-1 ring-amber-400/30">
          {isQuota ? (
            <AlertTriangle className="size-4 text-amber-200" aria-hidden />
          ) : (
            <Sparkles className="size-4 text-amber-200" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-50">{title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-100/75">{desc}</p>
          {isQuota ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={loading || isCoolingDown}
              className="touch-manipulation mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-amber-500/25 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
              {isCoolingDown ? t("retryIn", { seconds: remainingSec }) : t("errorRetry")}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
