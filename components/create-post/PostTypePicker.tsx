"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { POST_TYPES_BY_SECTION, sectionForPostType, type PostType } from "@/lib/postCategories";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";

type Props = {
  value: PostType | "";
  onChange: (type: PostType) => void;
};

export default function PostTypePicker({ value, onChange }: Props) {
  const t = useTranslations("CreatePost");
  const tNav = useTranslations("Nav");
  const labels = usePostTypeLabels();
  const [open, setOpen] = useState(!value);

  useEffect(() => {
    if (!value) setOpen(true);
  }, [value]);

  const handleSelect = (type: PostType) => {
    onChange(type);
    setOpen(false);
  };

  const navLabel = (section: "destinations" | "tours" | "guides") => {
    if (section === "destinations") return tNav("destinations");
    if (section === "tours") return tNav("tours");
    return tNav("guides");
  };

  return (
    <fieldset className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="text-sm font-semibold text-white/85">{t("pickType")}</span>
          {value ? (
            <span className="mt-0.5 block truncate text-xs text-violet-200/95">
              {labels.label(value)} → {navLabel(sectionForPostType(value))}
            </span>
          ) : (
            <span className="mt-0.5 block text-xs text-white/45">{t("pickTypeHint")}</span>
          )}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-white/45 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-2.5 border-t border-white/10 px-3 py-2.5">
          {POST_TYPES_BY_SECTION.map((group) => (
            <div key={group.section}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-violet-300/75">
                {labels.sectionLabel(group.section)}
                <span className="font-normal normal-case text-white/40"> → {navLabel(group.section)}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.types.map((type) => {
                  const selected = value === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelect(type)}
                      title={labels.description(type)}
                      aria-pressed={selected}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        selected
                          ? "border-violet-400/70 bg-violet-600/30 text-white ring-1 ring-violet-400/35"
                          : "border-white/12 bg-white/[0.04] text-white/75 hover:border-white/25 hover:bg-white/[0.08]"
                      }`}
                    >
                      {labels.shortLabel(type)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!value ? (
            <p className="text-[10px] text-amber-300/85" role="status">
              {t("pickTypeHint")}
            </p>
          ) : null}
        </div>
      ) : value ? (
        <p className="border-t border-white/10 px-3 py-1.5 text-[10px] leading-snug text-white/40">
          {labels.description(value)}
        </p>
      ) : null}
    </fieldset>
  );
}
