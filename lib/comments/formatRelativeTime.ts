/** Format Firestore timestamp seconds as relative time (Intl — locale-aware). */
export function formatRelativeTime(
  seconds: number | undefined,
  locale: string,
  labels?: { justNow?: string },
): string {
  if (!seconds || !Number.isFinite(seconds)) return labels?.justNow ?? "—";

  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 30) return labels?.justNow ?? "just now";

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diff < 60) return rtf.format(-diff, "second");
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  if (diff < 604800) return rtf.format(-Math.floor(diff / 86400), "day");
  if (diff < 2629800) return rtf.format(-Math.floor(diff / 604800), "week");
  if (diff < 31557600) return rtf.format(-Math.floor(diff / 2629800), "month");
  return rtf.format(-Math.floor(diff / 31557600), "year");
}

export function timestampToSeconds(ts: { seconds?: number } | null | undefined): number | undefined {
  return ts?.seconds;
}
