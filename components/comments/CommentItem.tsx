"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CommentActions from "@/components/comments/CommentActions";
import CommentAvatar from "@/components/comments/CommentAvatar";
import CommentImageGrid from "@/components/comments/CommentImageGrid";
import CommentInput from "@/components/comments/CommentInput";
import CommentUserName from "@/components/comments/CommentUserName";
import ReplyInput from "@/components/comments/ReplyInput";
import { sortCommentsOldestFirst } from "@/lib/comments/service";
import { formatRelativeTime, timestampToSeconds } from "@/lib/comments/formatRelativeTime";
import type { Comment, CommentAuthor, ReplyTarget } from "@/lib/comments/types";
import { useCommentReplies } from "@/hooks/useCommentActions";
import { useResolvedCommentAuthor } from "@/hooks/useResolvedCommentAuthor";
import { Skeleton } from "@/components/ui/Skeleton";

type CommentItemProps = {
  comment: Comment;
  postId: string;
  threadRootId: string;
  currentUserId: string | null;
  canModerate: boolean;
  isLiked: boolean;
  getIsLiked?: (commentId: string) => boolean;
  isSignedIn: boolean;
  author: CommentAuthor | null;
  isReply?: boolean;
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
  /** Notify thread root to show replies immediately after submit. */
  onReplySuccess?: () => void;
};

export default function CommentItem({
  comment,
  threadRootId,
  currentUserId,
  canModerate,
  isLiked,
  getIsLiked,
  isSignedIn,
  author,
  isReply,
  onLike,
  onEdit,
  onDelete,
  onReport,
  onReply,
  onUploadImage,
  onToast,
  onError,
  onReplySuccess,
}: CommentItemProps) {
  const t = useTranslations("Comments");
  const locale = useLocale();
  const [liking, setLiking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [threadForceOpen, setThreadForceOpen] = useState(false);
  const [optimisticLike, setOptimisticLike] = useState<boolean | null>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number | null>(null);

  const rootId = isReply ? threadRootId : comment.id;

  const { replies, loading: repliesLoading, hasReplies } = useCommentReplies(
    isReply ? null : comment.id,
    !isReply,
  );

  useEffect(() => {
    if (hasReplies) setThreadForceOpen(true);
  }, [hasReplies]);

  const visibleReplies = useMemo(() => sortCommentsOldestFirst(replies), [replies]);

  const isOwner = currentUserId === comment.userId;
  const liked = optimisticLike ?? isLiked;
  const likeCount = optimisticLikeCount ?? comment.likeCount;

  const fallback = t("memberFallback");
  const { displayName, avatar } = useResolvedCommentAuthor(
    comment.userId,
    comment.username,
    comment.userAvatar,
    fallback,
  );
  const { displayName: replyToDisplayName } = useResolvedCommentAuthor(
    comment.replyToUserId ?? "",
    comment.replyToUsername ?? undefined,
    null,
    fallback,
  );

  const timeLabel = useMemo(() => {
    const seconds = timestampToSeconds(comment.createdAt);
    return formatRelativeTime(seconds, locale, { justNow: t("justNow") });
  }, [comment.createdAt, locale, t]);

  const mapErr = (key: string) => {
    if (onError) onError(key);
    else onToast(t("replyError"));
  };

  const openReplyTo = () => {
    if (!isSignedIn) {
      onToast(t("signInToComment"));
      return;
    }
    setReplyOpen(true);
    if (!isReply) setThreadForceOpen(true);
    onReplySuccess?.();
  };

  const handleLike = async () => {
    if (!isSignedIn) {
      onToast(t("signInToLike"));
      return;
    }
    setLiking(true);
    const nextLiked = !liked;
    setOptimisticLike(nextLiked);
    setOptimisticLikeCount(Math.max(0, likeCount + (nextLiked ? 1 : -1)));
    try {
      await onLike(comment.id, isLiked);
    } catch {
      setOptimisticLike(null);
      setOptimisticLikeCount(null);
      onToast(t("likeError"));
    } finally {
      setLiking(false);
      setOptimisticLike(null);
      setOptimisticLikeCount(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await onDelete(comment.id, comment.parentId);
      onToast(t("deleted"));
    } catch {
      onToast(t("deleteError"));
    }
  };

  const handleReport = async (reason: string) => {
    try {
      await onReport(comment.id, reason);
      onToast(t("reported"));
    } catch (err) {
      const key = err instanceof Error ? err.message : "generic";
      mapErr(key);
    }
  };

  const replyTarget: ReplyTarget = {
    userId: comment.userId,
    username: displayName,
  };

  const submitReply = async (content: string, images: string[]) => {
    await onReply(rootId, content, images, replyTarget);
    setReplyOpen(false);
    if (!isReply) setThreadForceOpen(true);
    onReplySuccess?.();
    onToast(t("replyPosted"));
  };

  const showReplyThread =
    !isReply &&
    (threadForceOpen || hasReplies || repliesLoading || comment.replyCount > 0 || replyOpen);

  return (
    <article className={`group ${isReply ? "mt-2.5" : ""}`} data-comment-id={comment.id}>
      <div className={`flex gap-2.5 sm:gap-3 ${isReply ? "relative pl-1" : ""}`}>
        {isReply ? (
          <span className="absolute -left-3 top-4 hidden h-[calc(100%-1rem)] w-px bg-white/10 sm:block" aria-hidden />
        ) : null}
        <CommentAvatar src={avatar ?? comment.userAvatar} name={displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-white/[0.08] px-3.5 py-2.5 transition group-hover:bg-white/[0.1]">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <CommentUserName name={displayName} onClick={openReplyTo} />
              {comment.replyToUsername ? (
                <>
                  <span className="text-xs text-white/35">{t("replyArrow")}</span>
                  <CommentUserName
                    name={replyToDisplayName}
                    variant="mention"
                    onClick={openReplyTo}
                  />
                </>
              ) : null}
            </div>

            {editing ? (
              <div className="mt-2">
                <CommentInput
                  author={author}
                  isSignedIn={isSignedIn}
                  compact
                  submitLabel={t("saveEdit")}
                  onSubmit={async (content, images) => {
                    await onEdit(comment.id, content, images);
                    setEditing(false);
                    onToast(t("updated"));
                  }}
                  onUploadImage={onUploadImage}
                  onError={mapErr}
                />
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="mt-2 text-xs text-white/50 hover:text-white/70"
                >
                  {t("cancelEdit")}
                </button>
              </div>
            ) : (
              <>
                {comment.content ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/[0.92]">
                    {comment.content}
                  </p>
                ) : null}
                <CommentImageGrid urls={comment.images ?? []} />
              </>
            )}
          </div>

          {!editing ? (
            <CommentActions
              likeCount={likeCount}
              liked={liked}
              isOwner={isOwner}
              canModerate={canModerate}
              timeLabel={timeLabel}
              isEdited={comment.isEdited}
              onLike={() => void handleLike()}
              onReply={openReplyTo}
              onEdit={() => setEditing(true)}
              onDelete={() => void handleDelete()}
              onReport={(reason) => void handleReport(reason)}
              liking={liking}
            />
          ) : null}

          {showReplyThread && repliesLoading && visibleReplies.length === 0 ? (
            <div className="mt-2 pl-2">
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : null}

          {showReplyThread
            ? visibleReplies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={comment.postId}
                  threadRootId={comment.id}
                  currentUserId={currentUserId}
                  canModerate={canModerate}
                  isLiked={getIsLiked?.(reply.id) ?? false}
                  getIsLiked={getIsLiked}
                  isSignedIn={isSignedIn}
                  author={author}
                  isReply
                  onLike={onLike}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                  onReport={onReport}
                  onUploadImage={onUploadImage}
                  onToast={onToast}
                  onError={onError}
                  onReplySuccess={() => setThreadForceOpen(true)}
                />
              ))
            : null}

          {replyOpen ? (
            <ReplyInput
              author={author}
              isSignedIn={isSignedIn}
              replyingToName={replyTarget.username}
              onSubmit={submitReply}
              onUploadImage={onUploadImage}
              onError={mapErr}
              onCancel={() => setReplyOpen(false)}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
