"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import CommentItem from "@/components/comments/CommentItem";
import { CommentSkeleton } from "@/components/comments/CommentSkeleton";
import type { Comment, CommentAuthor, ReplyTarget } from "@/lib/comments/types";

type CommentListProps = {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  loadingMore?: boolean;
  postId: string;
  currentUserId: string | null;
  canModerate: boolean;
  isSignedIn: boolean;
  author: CommentAuthor | null;
  getIsLiked: (commentId: string) => boolean;
  onLoadMore: () => void;
  onLike: (commentId: string, liked: boolean) => Promise<void>;
  onEdit: (commentId: string, content: string, images: string[]) => Promise<void>;
  onDelete: (commentId: string, parentId: string | null) => Promise<void>;
  onReply: (
    threadRootId: string,
    content: string,
    images: string[],
    replyTo: ReplyTarget,
  ) => Promise<void>;
  onReport: (commentId: string, reason: string) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string>;
  onToast: (msg: string) => void;
  onError?: (key: string) => void;
};

export default function CommentList({
  comments,
  loading,
  hasMore,
  loadingMore,
  postId,
  currentUserId,
  canModerate,
  isSignedIn,
  author,
  getIsLiked,
  onLoadMore,
  onLike,
  onEdit,
  onDelete,
  onReply,
  onReport,
  onUploadImage,
  onToast,
  onError,
}: CommentListProps) {
  const t = useTranslations("Comments");
  const tc = useTranslations("Common");

  if (loading) return <CommentSkeleton count={4} />;

  if (comments.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          threadRootId={comment.id}
          currentUserId={currentUserId}
          canModerate={canModerate}
          isLiked={getIsLiked(comment.id)}
          getIsLiked={getIsLiked}
          isSignedIn={isSignedIn}
          author={author}
          onLike={onLike}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
          onReport={onReport}
          onUploadImage={onUploadImage}
          onToast={onToast}
          onError={onError}
        />
      ))}

      {hasMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-medium text-white/70 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-amber-200 disabled:opacity-50"
        >
          {loadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
          {tc("readMore")}
        </button>
      ) : null}
    </div>
  );
}
