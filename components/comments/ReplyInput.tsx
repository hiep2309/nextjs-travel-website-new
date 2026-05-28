"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import CommentInput from "@/components/comments/CommentInput";
import CommentUserName from "@/components/comments/CommentUserName";
import type { CommentAuthor } from "@/lib/comments/types";

type ReplyInputProps = {
  author: CommentAuthor | null;
  isSignedIn: boolean;
  replyingToName: string;
  onSubmit: (content: string, images: string[]) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string>;
  onError?: (key: string) => void;
  onCancel?: () => void;
};

export default function ReplyInput({
  author,
  isSignedIn,
  replyingToName,
  onSubmit,
  onUploadImage,
  onError,
  onCancel,
}: ReplyInputProps) {
  const t = useTranslations("Comments");
  const target = replyingToName.trim() || t("memberFallback");

  return (
    <div className="mt-2 border-l-2 border-amber-400/40 pl-3">
      <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5">
        <p className="text-xs text-white/75">
          {t("replyingTo")}{" "}
          <CommentUserName name={target} variant="mention" />
        </p>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-0.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label={t("cancelReply")}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      <CommentInput
        author={author}
        isSignedIn={isSignedIn}
        compact
        placeholder={t("replyPlaceholder", { name: target })}
        submitLabel={t("reply")}
        onSubmit={onSubmit}
        onUploadImage={onUploadImage}
        onError={onError}
      />
    </div>
  );
}
