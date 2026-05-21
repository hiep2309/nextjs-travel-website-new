"use client";

import { motion } from "framer-motion";
import { Gem } from "lucide-react";
import { useTranslations } from "next-intl";
import type { HiddenGem } from "@/lib/planner/types";

type Props = {
  gems: HiddenGem[];
  /** Show fewer cards on mobile overview sidebar */
  limit?: number;
};

export default function HiddenGems({ gems, limit }: Props) {
  const t = useTranslations("AiPlanner");
  if (!gems?.length) return null;

  const visible = limit ? gems.slice(0, limit) : gems;

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:rounded-2xl sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Gem className="size-5 text-violet-300" aria-hidden />
        <h3 className="text-sm font-bold uppercase tracking-wider text-violet-300/90">
          {t("hiddenGems")}
        </h3>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        {visible.map((g, i) => (
          <motion.article
            key={g.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4"
          >
            <h4 className="font-semibold text-white">{g.name}</h4>
            <p className="mt-1 text-sm leading-relaxed text-white/65">{g.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
