"use client";

import { Flag, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CommentActionsProps = {
  likeCount: number;
  liked: boolean;
  isOwner: boolean;
  canModerate: boolean;
  timeLabel: string;
  isEdited?: boolean;
  onLike: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: (reason: string) => void;
  liking?: boolean;
};

/** Facebook-style: Thích · Trả lời · thời gian */
export default function CommentActions({
  likeCount,
  liked,
  isOwner,
  canModerate,
  timeLabel,
  isEdited,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  liking,
}: CommentActionsProps) {
  const t = useTranslations("Comments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReport = () => {
    onReport(reportReason);
    setReportReason("");
    setReportOpen(false);
    setMenuOpen(false);
  };

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-1 px-1">
      <button
        type="button"
        onClick={onLike}
        disabled={liking}
        className={`rounded px-1.5 py-0.5 text-xs font-semibold transition hover:underline ${
          liked ? "text-rose-400" : "text-white/55 hover:text-rose-300"
        }`}
      >
        {liked ? t("liked") : t("like")}
        {likeCount > 0 ? ` · ${likeCount.toLocaleString()}` : ""}
      </button>
      <span className="text-white/25">·</span>
      <button
        type="button"
        onClick={onReply}
        className="rounded px-1.5 py-0.5 text-xs font-semibold text-white/55 transition hover:text-amber-300 hover:underline"
      >
        {t("reply")}
      </button>
      <span className="text-white/25">·</span>
      <time className="text-[11px] text-white/40" dateTime={timeLabel}>
        {timeLabel}
        {isEdited ? ` · ${t("edited")}` : ""}
      </time>

      {!isOwner && !canModerate ? (
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white/70"
            aria-label={t("more")}
          >
            <MoreHorizontal className="size-3.5" />
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10"
                aria-label={t("closeMenu")}
                onClick={() => {
                  setMenuOpen(false);
                  setReportOpen(false);
                }}
              />
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-xl border border-white/10 bg-slate-900/95 py-1 shadow-xl">
                {!reportOpen ? (
                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                  >
                    <Flag className="size-4 text-amber-400" />
                    {t("report")}
                  </button>
                ) : (
                  <div className="p-3">
                    <p className="text-xs font-medium text-white/70">{t("reportReason")}</p>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      rows={3}
                      className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-sm text-white outline-none focus:border-amber-400/50"
                      placeholder={t("reportPlaceholder")}
                    />
                    <button
                      type="button"
                      onClick={handleReport}
                      className="mt-2 w-full rounded-lg bg-amber-500/90 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400"
                    >
                      {t("submitReport")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {isOwner || canModerate ? (
        <div className="ml-auto flex items-center gap-0.5">
          {isOwner ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-amber-300"
              aria-label={t("edit")}
            >
              <Pencil className="size-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-red-300"
            aria-label={t("delete")}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
