"use client";

import { useCallback, useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { COMMENTS_PAGE_SIZE } from "@/lib/comments/constants";
import {
  createComment,
  deleteComment,
  filterTopLevelComments,
  mapCommentDoc,
  reportComment,
  repliesQuery,
  sortCommentsNewestFirst,
  sortCommentsOldestFirst,
  toggleCommentLike,
  topLevelCommentsQuery,
  updateComment,
  uploadCommentImage,
} from "@/lib/comments/service";
import type { Comment, CreateCommentInput, ReplyTarget } from "@/lib/comments/types";
import { resolveCommentAuthor } from "@/lib/comments/resolveCommentAuthor";
import { useAuth } from "@/hooks/useAuth";

type UseCommentsOptions = {
  postId: string;
  enabled?: boolean;
};

export function useComments({ postId, enabled = true }: UseCommentsOptions) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(COMMENTS_PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !postId) {
      setComments([]);
      setLoading(false);
      setQueryError(null);
      return;
    }

    setLoading(true);
    setQueryError(null);
    const q = topLevelCommentsQuery(postId);

    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) =>
          mapCommentDoc(d.id, d.data() as import("@/lib/comments/types").CommentRecord),
        );
        const topLevel = sortCommentsNewestFirst(filterTopLevelComments(all));
        setComments(topLevel.slice(0, pageSize));
        setHasMore(topLevel.length > pageSize);
        setQueryError(null);
        setLoading(false);
      },
      (err) => {
        console.error("[comments] listen failed:", err);
        setQueryError(err instanceof Error ? err.message : "listen-failed");
        setComments([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [postId, pageSize, enabled]);

  const loadMore = useCallback(() => {
    setPageSize((n) => n + COMMENTS_PAGE_SIZE);
  }, []);

  return { comments, loading, hasMore, loadMore, totalLoaded: comments.length, queryError };
}

export function useCommentReplies(parentId: string | null, enabled = true) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !parentId) {
      setReplies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = repliesQuery(parentId);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) =>
          mapCommentDoc(d.id, d.data() as import("@/lib/comments/types").CommentRecord),
        );
        setReplies(sortCommentsOldestFirst(rows));
        setLoading(false);
      },
      (err) => {
        console.error("[comments] replies listen failed:", err);
        setReplies([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [parentId, enabled]);

  return { replies, loading, hasReplies: replies.length > 0 };
}

export function useCommentActions(postId: string) {
  const { user, role } = useAuth();

  const submitComment = useCallback(
    async (
      content: string,
      images: string[],
      parentId?: string | null,
      replyTo?: ReplyTarget | null,
    ) => {
      if (!user) throw new Error("unauthorized");
      const author = await resolveCommentAuthor(user);

      const input: CreateCommentInput = {
        postId,
        content,
        images,
        parentId: parentId ?? null,
        replyTo: replyTo ?? null,
        author,
      };
      return createComment(input);
    },
    [user, postId],
  );

  const editComment = useCallback(
    async (commentId: string, content: string, images: string[]) => {
      await updateComment({ commentId, postId, content, images });
    },
    [postId],
  );

  const removeComment = useCallback(
    async (commentId: string, parentId: string | null) => {
      await deleteComment(commentId, postId, parentId);
    },
    [postId],
  );

  const likeComment = useCallback(
    async (commentId: string, currentlyLiked: boolean) => {
      if (!user?.uid) throw new Error("unauthorized");
      return toggleCommentLike(commentId, postId, user.uid, currentlyLiked);
    },
    [postId, user?.uid],
  );

  const report = useCallback(
    async (commentId: string, reason: string) => {
      if (!user?.uid) throw new Error("unauthorized");
      await reportComment(commentId, postId, user.uid, reason);
    },
    [postId, user?.uid],
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!user?.uid) throw new Error("unauthorized");
      return uploadCommentImage(user.uid, file);
    },
    [user?.uid],
  );

  const canModerate = role === "admin";

  return {
    user,
    submitComment,
    editComment,
    removeComment,
    likeComment,
    report,
    uploadImage,
    canModerate,
    isSignedIn: Boolean(user),
  };
}
