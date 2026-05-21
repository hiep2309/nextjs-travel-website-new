"use client";

import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ItineraryEmptyState() {
  const t = useTranslations("SavedItineraries");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-gradient-to-br from-white/[0.04] via-violet-950/10 to-slate-950/40 p-8 text-center backdrop-blur-sm sm:p-12"
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-blue-600/20 ring-1 ring-violet-400/30">
        <Compass className="size-8 text-violet-200" />
      </span>
      <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">{t("emptyTitle")}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/55">{t("emptyDesc")}</p>
      <Link
        href="/ai-trip-planner"
        className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-blue-500"
      >
        <Sparkles className="size-4" />
        {t("emptyCta")}
      </Link>
    </motion.div>
  );
}
