"use client";

import { useCallback, useEffect, useState } from "react";
import { FilePenLine, PenSquare, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";
import { POST_COVER_FALLBACK } from "@/lib/posts/coverImage";
import {
  getPostDraft,
  postDraftExcerpt,
  POST_DRAFTS_CHANGED_EVENT,
  removePostDraft,
  type PostDraft,
} from "@/lib/postDraftStorage";
import { formatRelativeTimeVi } from "@/lib/userActivityStorage";

type Props = {
  userId: string;
};

export default function ProfilePostDraftsPanel({ userId }: Props) {
  const t = useTranslations("Profile");
  const { label: labelForPostType } = usePostTypeLabels();
  const [draft, setDraft] = useState<PostDraft | null>(null);

  const reload = useCallback(() => {
    setDraft(getPostDraft(userId));
  }, [userId]);

  useEffect(() => {
    reload();
    const onChange = () => reload();
    window.addEventListener(POST_DRAFTS_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    const onVis = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener(POST_DRAFTS_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reload]);

  const handleDelete = () => {
    if (!window.confirm(t("draftDeleteConfirm"))) return;
    removePostDraft(userId);
    setDraft(null);
  };

  const cover = draft?.imageUrls[0]?.trim() || POST_COVER_FALLBACK;
  const title = draft?.title.trim() || t("draftUntitled");
  const excerpt = draft ? postDraftExcerpt(draft.html) : "";

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{t("drafts")}</h2>
          <p className="mt-1 text-sm text-white/55">{t("draftsDesc")}</p>
        </div>
        <Link
          href="/create-post"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
        >
          <Plus className="size-4" />
          {t("draftNew")}
        </Link>
      </div>

      {!draft ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
          <FilePenLine className="mx-auto size-10 text-violet-300/50" aria-hidden />
          <p className="mt-4 text-sm font-medium text-white/75">{t("emptyDrafts")}</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-white/45">{t("emptyDraftsHint")}</p>
          <Link
            href="/create-post"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-violet-500/35 bg-violet-500/15 px-5 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25"
          >
            <PenSquare className="size-4" />
            {t("draftStart")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800 sm:aspect-auto sm:h-36 sm:w-48">
              <FlexibleImage src={cover} alt="" sizes="192px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
                  {t("draftBadge")}
                </span>
                {draft.postType ? (
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-200/90">
                    {labelForPostType(draft.postType)}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 line-clamp-2 text-lg font-bold text-white">{title}</h3>
              {draft.destination ? (
                <p className="mt-1 text-xs text-white/50">{draft.destination}</p>
              ) : null}
              {excerpt ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/60">{excerpt}</p>
              ) : (
                <p className="mt-2 text-sm italic text-white/35">{t("draftNoContent")}</p>
              )}
              <p className="mt-3 text-[11px] text-white/40">
                {t("draftUpdated", { time: formatRelativeTimeVi(draft.updatedAt) })}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/create-post"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:from-violet-500 hover:to-blue-500"
                >
                  <PenSquare className="size-4" />
                  {t("draftContinue")}
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  <Trash2 className="size-4" />
                  {t("draftDelete")}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/40">
            {t("draftBrowserNote")}
          </p>
        </div>
      )}
    </div>
  );
}
