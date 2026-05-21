"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, Lightbulb } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getCategoryStyle } from "@/lib/planner/categoryStyle";
import { easeOut } from "@/lib/planner/motionPresets";
import type { TripActivity, TripDay } from "@/lib/planner/types";

const FALLBACK_IMG = "/signup_pic.jpg";

type Props = {
  day: TripDay;
  /** Changes when switching tabs — retriggers enter animation */
  animateKey?: string | number;
};

export default function TripTimeline({ day, animateKey }: Props) {
  const t = useTranslations("AiPlanner");
  const reduceMotion = useReducedMotion();

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
        delayChildren: reduceMotion ? 0 : 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: easeOut },
    },
  };

  return (
    <div className="relative">
      <motion.header
        key={`header-${animateKey ?? day.day}`}
        variants={headerVariants}
        initial="hidden"
        animate="show"
        className="mb-5 flex flex-wrap items-end justify-between gap-2 sm:mb-6 sm:gap-3"
      >
        <div className="min-w-0">
          <motion.span
            initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 400 }}
            className="inline-flex items-center rounded-full border border-violet-400/35 bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-200 sm:px-3 sm:py-1 sm:text-[11px]"
          >
            {t("dayLabel", { n: day.day })}
          </motion.span>
          <h3 className="mt-1.5 text-lg font-bold tracking-tight text-white sm:mt-2 sm:text-xl lg:text-2xl">
            {day.theme}
          </h3>
        </div>
        <p className="text-xs text-white/45 sm:text-sm">
          {t("activityCount", { count: day.activities.length })}
        </p>
      </motion.header>

      <div className="relative">
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-[9px] top-0 w-px origin-top bg-gradient-to-b from-violet-400/80 via-violet-400/30 to-transparent sm:left-[11px] lg:left-[13px]"
          initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.08 }}
        />

        <motion.ol
          key={animateKey ?? day.day}
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="relative space-y-4 pl-7 sm:space-y-5 sm:pl-9 lg:pl-10"
        >
          {day.activities.map((act, i) => (
            <TimelineActivity
              key={`${day.day}-${act.time}-${act.place_name}-${i}`}
              activity={act}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.ol>
      </div>
    </div>
  );
}

function TimelineActivity({
  activity,
  index,
  reduceMotion,
}: {
  activity: TripActivity;
  index: number;
  reduceMotion: boolean | null;
}) {
  const t = useTranslations("AiPlanner");
  const style = getCategoryStyle(activity.category);
  const Icon = style.icon;

  const itemVariants = {
    hidden: { opacity: 0, x: reduceMotion ? 0 : 14, scale: reduceMotion ? 1 : 0.98 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 340, damping: 28 },
    },
  };

  return (
    <motion.li variants={itemVariants} className="relative">
      <motion.span
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 + index * 0.06, type: "spring", stiffness: 500 }}
        className={`absolute -left-7 top-4 z-10 flex size-5 items-center justify-center rounded-full bg-gradient-to-br sm:-left-9 sm:top-5 sm:size-6 lg:-left-10 ${style.accent} ring-2 ${style.ring} shadow-lg shadow-black/30`}
      >
        <Icon className="size-2.5 text-white sm:size-3" aria-hidden />
      </motion.span>

      <motion.article
        whileHover={reduceMotion ? undefined : { y: -2, scale: 1.005 }}
        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group touch-manipulation overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/20 backdrop-blur-sm transition-colors hover:border-violet-400/35 hover:bg-white/[0.07] sm:rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-28 w-full shrink-0 overflow-hidden sm:h-auto sm:w-40 sm:min-h-[140px]">
            <Image
              src={FALLBACK_IMG}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width:640px) 100vw, 160px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-black/20 sm:to-black/50" />
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-white/20 bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md sm:left-3 sm:top-3 sm:py-1 sm:text-xs"
            >
              <Clock className="size-3 text-violet-300" aria-hidden />
              {activity.time}
            </motion.span>
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-sm">
              #{index + 1}
            </span>
          </div>

          <div className="min-w-0 flex-1 p-3.5 sm:p-4 lg:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {activity.category ? (
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
                >
                  {activity.category}
                </span>
              ) : null}
            </div>

            <h4 className="mt-1.5 text-base font-bold text-white transition group-hover:text-violet-100 sm:mt-2 sm:text-lg">
              {activity.place_name}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-white/65">{activity.description}</p>

            {activity.tips ? (
              <motion.p
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.04 }}
                className="mt-2.5 flex gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-2.5 py-2 text-xs leading-relaxed text-amber-100/90 sm:mt-3 sm:rounded-xl sm:px-3"
              >
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-300" aria-hidden />
                <span>{activity.tips}</span>
              </motion.p>
            ) : null}

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 sm:mt-4 sm:pt-3">
              <span className="text-xs text-white/45">{t("cost")}</span>
              <span className="text-sm font-bold text-violet-200">{activity.estimated_cost}</span>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.li>
  );
}
