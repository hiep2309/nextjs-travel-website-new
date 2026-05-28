"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CommentAvatar from "@/components/comments/CommentAvatar";
import ImagePreview, { type PreviewImage } from "@/components/comments/ImagePreview";
import { MAX_COMMENT_IMAGES, MAX_COMMENT_LENGTH } from "@/lib/comments/constants";
import { parseImageUrlForComment } from "@/lib/comments/service";
import type { CommentAuthor } from "@/lib/comments/types";

type CommentInputProps = {
  author: CommentAuthor | null;
  isSignedIn: boolean;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  busy?: boolean;
  onSubmit: (content: string, imageUrls: string[]) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string>;
  onError?: (key: string) => void;
};

function newPreviewId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function CommentInput({
  author,
  isSignedIn,
  placeholder,
  submitLabel,
  compact,
  busy,
  onSubmit,
  onUploadImage,
  onError,
}: CommentInputProps) {
  const t = useTranslations("Comments");
  const tc = useTranslations("Common");
  const te = useTranslations("Errors");
  const [content, setContent] = useState("");
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const removePreview = useCallback((id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.source === "file" && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const addUrl = () => {
    const parsed = parseImageUrlForComment(urlInput);
    if (!parsed) {
      onError?.("invalidImageUrl");
      return;
    }
    if (previews.length >= MAX_COMMENT_IMAGES) {
      onError?.("tooManyImages");
      return;
    }
    setPreviews((prev) => [...prev, { id: newPreviewId(), url: parsed, source: "url" }]);
    setUrlInput("");
    setShowUrl(false);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !onUploadImage) return;
    if (previews.length >= MAX_COMMENT_IMAGES) {
      onError?.("tooManyImages");
      return;
    }

    setUploading(true);
    try {
      const uploaded: PreviewImage[] = [];
      for (const file of Array.from(files)) {
        if (previews.length + uploaded.length >= MAX_COMMENT_IMAGES) break;
        const remoteUrl = await onUploadImage(file);
        uploaded.push({ id: newPreviewId(), url: remoteUrl, source: "url" });
      }
      if (uploaded.length === 0) {
        onError?.("uploadFailed");
        return;
      }
      setPreviews((prev) => [...prev, ...uploaded]);
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      onError?.(code === "permission-denied" ? "rulesNotDeployed" : "uploadFailed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    const urls = previews
      .map((p) => p.url.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"));
    if (!trimmed && urls.length === 0) return;

    setSubmitting(true);
    try {
      await onSubmit(trimmed, urls);
      setContent("");
      previews.forEach((p) => {
        if (p.source === "file" && p.url.startsWith("blob:")) URL.revokeObjectURL(p.url);
      });
      setPreviews([]);
    } catch (err) {
      const key =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : err instanceof Error
            ? err.message
            : "generic";
      onError?.(key === "permission-denied" ? "rulesNotDeployed" : key);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
        <p className="text-sm text-white/60">{te("unauthorized")}</p>
        <Link
          href="/login"
          className="mt-2 inline-block text-sm font-semibold text-amber-300 hover:underline"
        >
          {t("signInToComment")}
        </Link>
      </div>
    );
  }

  const disabled = submitting || busy || uploading;
  const remaining = MAX_COMMENT_LENGTH - content.length;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-amber-400/30 focus-within:bg-white/[0.06] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex gap-3">
        {author ? <CommentAvatar src={author.userAvatar} name={author.username} size="sm" /> : null}
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            rows={compact ? 2 : 3}
            disabled={disabled}
            placeholder={placeholder ?? t("placeholder")}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-white/90 outline-none placeholder:text-white/35"
          />
          <ImagePreview images={previews} onRemove={removePreview} />
          {showUrl ? (
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t("imageUrlPlaceholder")}
                className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-amber-400/40"
              />
              <button
                type="button"
                onClick={addUrl}
                className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
              >
                {tc("submit")}
              </button>
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              disabled={disabled || previews.length >= MAX_COMMENT_IMAGES}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-amber-300 disabled:opacity-40"
            >
              <Link2 className="size-3.5" />
              {t("addUrl")}
            </button>
            {onUploadImage ? (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={disabled || previews.length >= MAX_COMMENT_IMAGES}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-amber-300 disabled:opacity-40"
                >
                  {uploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="size-3.5" />
                  )}
                  {t("uploadImage")}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleFiles(e.target.files)}
                />
              </>
            ) : null}
            <span className="ml-auto text-[11px] text-white/35">
              {remaining.toLocaleString()} / {MAX_COMMENT_LENGTH}
            </span>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={disabled || (!content.trim() && previews.length === 0)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              {submitLabel ?? t("post")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
