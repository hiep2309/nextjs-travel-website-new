"use client";

import { MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import CommentInput from "@/components/comments/CommentInput";
import CommentList from "@/components/comments/CommentList";
import { useCommentActions, useComments } from "@/hooks/useCommentActions";
import { useCommentLikesForPost } from "@/hooks/useCommentLikes";
import { useUserProfile } from "@/hooks/useUserProfile";
import { pickDisplayName } from "@/lib/comments/displayName";

type CommentSectionProps = {
  postId: string;
  enabled?: boolean;
  commentCount?: number;
  onToast: (message: string) => void;
};

export default function CommentSection({
  postId,
  enabled = true,
  commentCount,
  onToast,
}: CommentSectionProps) {
  const t = useTranslations("Comments");
  const { comments, loading, hasMore, loadMore, queryError } = useComments({ postId, enabled });
  const { profile } = useUserProfile();
  const actions = useCommentActions(postId);
  const { isLiked } = useCommentLikesForPost(postId, actions.user?.uid);

  const author = profile
    ? {
        uid: profile.uid,
        username: pickDisplayName(profile.name, profile.name, profile.email, t("memberFallback")),
        userAvatar:
          profile.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff`,
      }
    : null;

  const totalComments = commentCount ?? comments.length;

  const mapError = (key: string) => {
    const map: Record<string, string> = {
      empty: t("errors.empty"),
      tooLong: t("errors.tooLong"),
      tooManyImages: t("errors.tooManyImages"),
      invalidImageUrl: t("errors.invalidImageUrl"),
      uploadFailed: t("errors.uploadFailed"),
      unauthorized: t("errors.unauthorized"),
    };
    onToast(map[key] ?? t("errors.generic"));
  };

  return (
    <section
      id="comments"
      className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
      aria-label={t("sectionTitle")}
    >
      <div className="mb-5 flex items-center gap-2">
        <MessageSquareText className="size-5 text-amber-400" aria-hidden />
        <h2 className="text-lg font-bold text-white">{t("sectionTitle")}</h2>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70">
          {totalComments.toLocaleString()}
        </span>
      </div>

      <CommentInput
        author={author}
        isSignedIn={actions.isSignedIn}
        onSubmit={async (content, images) => {
          try {
            await actions.submitComment(content, images);
            onToast(t("posted"));
          } catch (err) {
            const code =
              err && typeof err === "object" && "code" in err
                ? String((err as { code?: string }).code)
                : "";
            if (code === "permission-denied") {
              onToast(t("errors.rulesNotDeployed"));
              return;
            }
            mapError(err instanceof Error ? err.message : "generic");
          }
        }}
        onUploadImage={actions.uploadImage}
        onError={mapError}
      />

      {queryError ? (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {t("loadError")}
        </p>
      ) : null}

      <div className="mt-6">
        <CommentList
          comments={comments}
          loading={loading}
          hasMore={hasMore}
          postId={postId}
          currentUserId={actions.user?.uid ?? null}
          canModerate={actions.canModerate}
          isSignedIn={actions.isSignedIn}
          author={author}
          getIsLiked={isLiked}
          onLoadMore={loadMore}
          onLike={async (commentId, liked) => {
            await actions.likeComment(commentId, liked);
          }}
          onEdit={actions.editComment}
          onDelete={actions.removeComment}
          onReply={async (threadRootId, content, images, replyTo) => {
            try {
              await actions.submitComment(content, images, threadRootId, replyTo);
            } catch (err) {
              const code =
                err && typeof err === "object" && "code" in err
                  ? String((err as { code?: string }).code)
                  : "";
              if (code === "permission-denied") {
                onToast(t("errors.rulesNotDeployed"));
                throw err;
              }
              mapError(err instanceof Error ? err.message : "generic");
              throw err;
            }
          }}
          onReport={actions.report}
          onUploadImage={actions.uploadImage}
          onToast={onToast}
          onError={mapError}
        />
      </div>
    </section>
  );
}
