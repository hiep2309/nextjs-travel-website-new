"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  Car,
  MapPin,
  Plane,
  Sparkles,
  Train,
  Users,
  Wallet,
  Bike,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { fadeUp } from "@/lib/planner/motionPresets";
import {
  FREE_MAX_DAYS,
  PREMIUM_MAX_DAYS,
} from "@/lib/planner/plannerConfig";
import {
  PACE_OPTIONS,
  TRANSPORT_OPTIONS,
  TRAVEL_STYLES,
  type PlannerFormData,
  type Transportation,
} from "@/lib/planner/types";

const glass =
  "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl sm:rounded-3xl";

const touchBtn =
  "touch-manipulation min-h-[44px] active:scale-[0.98] transition-transform";

type UsageInfo = {
  count: number;
  limit: number;
  remaining: number;
};

type Props = {
  value: PlannerFormData;
  onChange: (next: PlannerFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  usage?: UsageInfo | null;
};

const transportIcons: Record<Transportation, typeof Car> = {
  Car,
  Motorbike: Bike,
  Airplane: Plane,
  Train,
};

export default function PlannerForm({ value, onChange, onSubmit, loading, usage }: Props) {
  const t = useTranslations("AiPlanner");
  const reduceMotion = useReducedMotion();
  const maxDays = value.premiumMode ? PREMIUM_MAX_DAYS : FREE_MAX_DAYS;

  const set = <K extends keyof PlannerFormData>(key: K, v: PlannerFormData[K]) => {
    onChange({ ...value, [key]: v });
  };

  return (
    <motion.aside
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      animate="show"
      className={`${glass} p-4 sm:p-6 lg:sticky lg:top-24 lg:p-7 xl:top-28`}
    >
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/30 sm:h-11 sm:w-11 sm:rounded-2xl">
          <Sparkles className="size-5 text-white" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/90 sm:tracking-[0.2em]">
            {t("eyebrow")}
          </p>
          <h1 className="truncate text-lg font-bold text-white sm:text-xl lg:text-2xl">{t("title")}</h1>
        </div>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-white/60 sm:mb-6">{t("subtitle")}</p>

      {usage ? (
        <p
          className={`mb-4 rounded-xl border px-3 py-2 text-xs ${
            usage.remaining <= 0
              ? "border-amber-400/30 bg-amber-950/30 text-amber-100/90"
              : "border-white/10 bg-black/20 text-white/70"
          }`}
        >
          {usage.remaining <= 0 ? t("dailyLimitHint") : t("dailyUsage", { remaining: usage.remaining, limit: usage.limit })}
        </p>
      ) : null}

      <form
        className="space-y-4 sm:space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Field label={t("destination")} icon={MapPin}>
          <input
            required
            value={value.destination}
            onChange={(e) => set("destination", e.target.value)}
            className={inputCls}
            placeholder={t("destinationPh")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Field label={t("days")} icon={Calendar}>
            <input
              type="number"
              min={1}
              max={maxDays}
              inputMode="numeric"
              required
              value={value.days}
              onChange={(e) =>
                set("days", Math.max(1, Math.min(maxDays, Number(e.target.value) || 1)))
              }
              className={inputCls}
            />
          </Field>
          <Field label={t("travelers")} icon={Users}>
            <input
              type="number"
              min={1}
              max={20}
              inputMode="numeric"
              required
              value={value.travelers}
              onChange={(e) =>
                set("travelers", Math.max(1, Math.min(20, Number(e.target.value) || 1)))
              }
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={t("budget")} icon={Wallet}>
          <input
            required
            value={value.budget}
            onChange={(e) => set("budget", e.target.value)}
            className={inputCls}
            placeholder={t("budgetPh")}
          />
        </Field>

        <ChipGroup label={t("travelStyle")}>
          {TRAVEL_STYLES.map((s) => (
            <Pill
              key={s}
              active={value.travelStyle === s}
              onClick={() => set("travelStyle", s)}
              label={t(`style_${s}`)}
            />
          ))}
        </ChipGroup>

        <ChipGroup label={t("transportation")}>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {TRANSPORT_OPTIONS.map((tr) => {
              const Icon = transportIcons[tr];
              return (
                <button
                  key={tr}
                  type="button"
                  onClick={() => set("transportation", tr)}
                  className={`${touchBtn} inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold sm:px-3 ${
                    value.transportation === tr
                      ? "border-violet-400/50 bg-violet-600/30 text-white"
                      : "border-white/15 bg-black/25 text-white/70 hover:border-white/25"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{t(`transport_${tr}`)}</span>
                </button>
              );
            })}
          </div>
        </ChipGroup>

        <ChipGroup label={t("pace")}>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            {PACE_OPTIONS.map((p) => (
              <Pill
                key={p}
                active={value.pace === p}
                onClick={() => set("pace", p)}
                label={t(`pace_${p}`)}
                className="justify-center"
              />
            ))}
          </div>
        </ChipGroup>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <input
            type="checkbox"
            checked={Boolean(value.premiumMode)}
            onChange={(e) => set("premiumMode", e.target.checked)}
            className="mt-1 size-4 rounded border-white/20 accent-violet-500"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white">{t("premiumMode")}</span>
            <span className="mt-0.5 block text-xs text-white/55">{t("premiumModeDesc")}</span>
          </span>
        </label>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={reduceMotion || loading ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion || loading ? undefined : { scale: 0.98 }}
          className={`${touchBtn} flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-900/40 disabled:opacity-60 sm:rounded-2xl`}
        >
          <Sparkles className="size-4" aria-hidden />
          {loading ? t("generatingBtn") : t("submit")}
        </motion.button>
      </form>
    </motion.aside>
  );
}

const inputCls =
  "w-full min-h-[44px] rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-base text-white outline-none placeholder:text-white/35 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 sm:text-sm touch-manipulation";

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </span>
      <div className="relative">
        {children}
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
      </div>
    </label>
  );
}

function Pill({
  active,
  onClick,
  label,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${touchBtn} inline-flex items-center rounded-xl border px-3 py-2.5 text-xs font-semibold ${className} ${
        active
          ? "border-violet-400/50 bg-violet-600/35 text-white shadow-md shadow-violet-900/20"
          : "border-white/15 bg-black/25 text-white/70 hover:border-white/25 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
