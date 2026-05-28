"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";

/** Real-time set of comment IDs the current user has liked on a post. */
export function useCommentLikesForPost(postId: string, userId: string | null | undefined) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId || !userId) {
      setLikedIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, COLLECTIONS.commentLikes),
      where("postId", "==", postId),
      where("userId", "==", userId),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = new Set<string>();
        snap.docs.forEach((d) => {
          const commentId = d.data().commentId;
          if (typeof commentId === "string") next.add(commentId);
        });
        setLikedIds(next);
        setLoading(false);
      },
      () => {
        setLikedIds(new Set());
        setLoading(false);
      },
    );

    return () => unsub();
  }, [postId, userId]);

  return { likedIds, loading, isLiked: (commentId: string) => likedIds.has(commentId) };
}
