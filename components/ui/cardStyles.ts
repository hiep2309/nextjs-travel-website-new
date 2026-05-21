export const glassCard = {
  vertical:
    "overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg transition hover:border-amber-400/40",
  horizontal:
    "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141b2e]/90 shadow-lg transition hover:border-amber-500/30",
  carousel:
    "flex shrink-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900/40 shadow-xl backdrop-blur-md transition hover:border-amber-400/35 sm:w-[272px] w-[min(280px,calc(100vw-3rem))] lg:rounded-3xl",
  destinationCompact:
    "group flex gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-amber-400/40",
  overlay:
    "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-amber-400/35 hover:bg-white/[0.07]",
} as const;

export const badgeStyles: Record<
  "amber" | "violet" | "overlay" | "dark",
  string
> = {
  amber: "border-amber-400/35 bg-amber-500/10 text-amber-200",
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  overlay:
    "border-white/25 bg-black/45 text-white backdrop-blur-md",
  dark: "bg-black/55 text-white/90 backdrop-blur-sm",
};
