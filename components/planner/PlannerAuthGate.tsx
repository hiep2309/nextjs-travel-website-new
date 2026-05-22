"use client";

import { ArrowLeft, Compass, LogIn, Sparkles, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const glass =
  "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl sm:rounded-3xl";

export default function PlannerAuthGate() {
  const t = useTranslations("AiPlanner");

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("authBrowseHome")}
      </Link>

      <div className={`${glass} w-full p-6 text-center sm:p-8`}>
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/40">
          <Sparkles className="size-6 text-white" aria-hidden />
        </span>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/90">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">{t("authRequiredDesc")}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/register"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-blue-500"
          >
            <UserPlus className="size-4" />
            {t("authRegister")}
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LogIn className="size-4" />
            {t("authLogin")}
          </Link>
        </div>

        <p className="mt-6 text-xs text-white/40">{t("authRequiredHint")}</p>
      </div>

      <Link
        href="/explore"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
      >
        <Compass className="size-4" aria-hidden />
        {t("authBrowseExplore")}
      </Link>
    </div>
  );
}
