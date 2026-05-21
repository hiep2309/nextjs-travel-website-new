"use client";

import { Eye } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";

function numberLocale(locale: AppLocale): string {
  if (locale === "vi") return "vi-VN";
  if (locale === "ko") return "ko-KR";
  return "en-US";
}

type Props = {
  region?: string;
  views?: number;
  travelTime?: string;
  metaLine?: string;
  className?: string;
  showViews?: boolean;
};

export default function CardMeta({
  region,
  views,
  travelTime,
  metaLine,
  className = "mt-3 flex flex-wrap gap-3 text-xs text-white/55",
  showViews = true,
}: Props) {
  const locale = useLocale() as AppLocale;
  const tc = useTranslations("Common");
  const fmt = numberLocale(locale);

  if (metaLine) {
    return <p className={className}>{metaLine}</p>;
  }

  const hasContent = region || travelTime || (showViews && views !== undefined);
  if (!hasContent) return null;

  return (
    <p className={className}>
      {region ? <span>{region}</span> : null}
      {travelTime ? <span>{travelTime}</span> : null}
      {showViews && views !== undefined ? (
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3.5 shrink-0" aria-hidden />
          {views.toLocaleString(fmt)} {tc("views")}
        </span>
      ) : null}
    </p>
  );
}
