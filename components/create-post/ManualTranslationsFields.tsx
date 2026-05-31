"use client";

import { useTranslations } from "next-intl";
import type { ManualArticleDrafts } from "@/lib/posts/manualArticleLocales";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manualOnly: boolean;
  onManualOnlyChange: (value: boolean) => void;
  drafts: ManualArticleDrafts;
  onChange: (drafts: ManualArticleDrafts) => void;
};

function LocaleFields({
  locale,
  label,
  draft,
  onUpdate,
}: {
  locale: "en" | "ko";
  label: string;
  draft?: { title: string; content: string };
  onUpdate: (locale: "en" | "ko", patch: Partial<{ title: string; content: string }>) => void;
}) {
  const t = useTranslations("CreatePost");
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-300/90">{label}</p>
      <label className="mt-3 block text-sm font-semibold text-white/75">
        {t("manualTitle")}
        <input
          value={draft?.title ?? ""}
          onChange={(e) => onUpdate(locale, { title: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
          placeholder={t("manualTitlePh")}
        />
      </label>
      <label className="mt-3 block text-sm font-semibold text-white/75">
        {t("manualContent")}
        <textarea
          value={draft?.content ?? ""}
          onChange={(e) => onUpdate(locale, { content: e.target.value })}
          rows={8}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm leading-relaxed text-white outline-none focus:border-violet-500/50"
          placeholder={t("manualContentPh")}
        />
      </label>
    </div>
  );
}

export default function ManualTranslationsFields({
  open,
  onOpenChange,
  manualOnly,
  onManualOnlyChange,
  drafts,
  onChange,
}: Props) {
  const t = useTranslations("CreatePost");

  const updateLocale = (locale: "en" | "ko", patch: Partial<{ title: string; content: string }>) => {
    onChange({
      ...drafts,
      [locale]: { title: drafts[locale]?.title ?? "", content: drafts[locale]?.content ?? "", ...patch },
    });
  };

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] p-4 sm:p-5">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-bold text-violet-100">{t("manualSectionTitle")}</p>
          <p className="mt-1 text-xs text-white/50">{t("manualSectionHint")}</p>
        </div>
        <span className="text-lg text-violet-300/80">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div className="mt-4 space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <input
              type="checkbox"
              checked={manualOnly}
              onChange={(e) => onManualOnlyChange(e.target.checked)}
              className="mt-1 size-4 rounded border-white/20"
            />
            <span>
              <span className="block text-sm font-semibold text-white/85">{t("manualOnlyLabel")}</span>
              <span className="mt-0.5 block text-xs text-white/45">{t("manualOnlyHint")}</span>
            </span>
          </label>

          <LocaleFields
            locale="en"
            label={t("manualEn")}
            draft={drafts.en}
            onUpdate={updateLocale}
          />
          <LocaleFields
            locale="ko"
            label={t("manualKo")}
            draft={drafts.ko}
            onUpdate={updateLocale}
          />
        </div>
      ) : null}
    </div>
  );
}
