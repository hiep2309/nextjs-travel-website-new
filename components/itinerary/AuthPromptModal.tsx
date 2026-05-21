"use client";

import { motion } from "framer-motion";
import { LogIn, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AuthPromptModal({ open, onClose }: Props) {
  const t = useTranslations("SavedItineraries");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label={t("authClose")}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-violet-950/40 p-6 shadow-2xl shadow-violet-950/40 backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/40">
          <Sparkles className="size-5 text-white" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-white">{t("authTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{t("authDesc")}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-900/30"
          >
            <LogIn className="size-4" />
            {t("authLogin")}
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t("authRegister")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
