import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestoreCollections";
import { prepareImageForUpload } from "@/lib/imageUploadPrep";
import { normalizeCommentImageUrl } from "@/lib/comments/imageValidation";
import { MAX_COMMENT_IMAGES } from "@/lib/comments/constants";
import type {
  Comment,
  CommentRecord,
  CreateCommentInput,
  UpdateCommentInput,
} from "@/lib/comments/types";
import { validateCommentPayload, validateReportReason } from "@/lib/comments/validation";

function commentLikeId(commentId: string, userId: string): string {
  return `${commentId}_${userId}`;
}

export function mapCommentDoc(id: string, data: CommentRecord): Comment {
  const images = Array.isArray(data.images)
    ? data.images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    : [];
  return { id, ...data, images };
}

/**
 * Query by postId only (single-field index — no composite index required).
 * Filter `parentId == null` and sort by `createdAt` on the client.
 */
export function topLevelCommentsQuery(postId: string, fetchLimit = 80) {
  return query(collection(db, COLLECTIONS.comments), where("postId", "==", postId), limit(fetchLimit));
}

export function repliesQuery(parentId: string) {
  return query(collection(db, COLLECTIONS.comments), where("parentId", "==", parentId));
}

export function sortCommentsNewestFirst(comments: Comment[]): Comment[] {
  return [...comments].sort(
    (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
  );
}

export function sortCommentsOldestFirst(comments: Comment[]): Comment[] {
  return [...comments].sort(
    (a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0),
  );
}

export function filterTopLevelComments(comments: Comment[]): Comment[] {
  return comments.filter((c) => c.parentId == null);
}

export async function uploadCommentImage(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("invalidImageType");
  }
  const prepared = await prepareImageForUpload(file);
  const ext =
    prepared.type === "image/webp"
      ? "webp"
      : prepared.type === "image/png"
        ? "png"
        : "jpg";
  const path = `comments/${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sref = ref(storage, path);
  await uploadBytes(sref, prepared, { contentType: prepared.type });
  return getDownloadURL(sref);
}

export async function createComment(input: CreateCommentInput): Promise<string> {
  const images = input.images ?? [];
  const validated = validateCommentPayload(input.content, images);
  if (!validated.ok) throw new Error(validated.error);

  const refDoc = doc(collection(db, COLLECTIONS.comments));
  const now = serverTimestamp();
  const parentId = input.parentId ?? null;

  const record: CommentRecord = {
    postId: input.postId,
    userId: input.author.uid,
    username: input.author.username.trim() || "Thành viên",
    userAvatar: input.author.userAvatar,
    content: validated.content,
    images: validated.images,
    createdAt: now as CommentRecord["createdAt"],
    updatedAt: now as CommentRecord["updatedAt"],
    likeCount: 0,
    replyCount: 0,
    parentId,
    isEdited: false,
    replyToUserId: input.replyTo?.userId ?? null,
    replyToUsername: input.replyTo?.username?.trim() || null,
  };

  // Write comment first — counter bump is best-effort (rules/index may block batch otherwise).
  await setDoc(refDoc, record);

  try {
    if (!parentId) {
      await updateDoc(doc(db, COLLECTIONS.posts, input.postId), {
        commentCount: increment(1),
      });
    } else {
      await updateDoc(doc(db, COLLECTIONS.comments, parentId), {
        replyCount: increment(1),
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[comments] Counter bump failed (comment was saved):", err);
    }
  }

  return refDoc.id;
}

export async function updateComment(input: UpdateCommentInput): Promise<void> {
  const validated = validateCommentPayload(input.content, input.images ?? []);
  if (!validated.ok) throw new Error(validated.error);

  await updateDoc(doc(db, COLLECTIONS.comments, input.commentId), {
    content: validated.content,
    images: validated.images,
    updatedAt: serverTimestamp(),
    isEdited: true,
  });
}

export async function deleteComment(
  commentId: string,
  postId: string,
  parentId: string | null,
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.comments, commentId));

  if (!parentId) {
    batch.update(doc(db, COLLECTIONS.posts, postId), {
      commentCount: increment(-1),
    });
  } else {
    batch.update(doc(db, COLLECTIONS.comments, parentId), {
      replyCount: increment(-1),
    });
  }

  await batch.commit();
}

export async function toggleCommentLike(
  commentId: string,
  postId: string,
  userId: string,
  currentlyLiked: boolean,
): Promise<boolean> {
  const likeRef = doc(db, COLLECTIONS.commentLikes, commentLikeId(commentId, userId));
  const commentRef = doc(db, COLLECTIONS.comments, commentId);
  const batch = writeBatch(db);

  if (currentlyLiked) {
    batch.delete(likeRef);
    batch.update(commentRef, { likeCount: increment(-1) });
  } else {
    batch.set(likeRef, {
      commentId,
      postId,
      userId,
      createdAt: serverTimestamp(),
    });
    batch.update(commentRef, { likeCount: increment(1) });
  }

  await batch.commit();
  return !currentlyLiked;
}

export async function checkCommentLiked(commentId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COLLECTIONS.commentLikes, commentLikeId(commentId, userId)));
  return snap.exists();
}

export async function reportComment(
  commentId: string,
  postId: string,
  reporterId: string,
  reason: string,
): Promise<void> {
  const validated = validateReportReason(reason);
  if (!validated.ok) throw new Error(validated.error);

  const reportRef = doc(collection(db, COLLECTIONS.commentReports));
  await setDoc(reportRef, {
    commentId,
    postId,
    reporterId,
    reason: validated.reason,
    createdAt: serverTimestamp(),
    status: "pending",
  });
}

export function parseImageUrlForComment(raw: string): string | null {
  return normalizeCommentImageUrl(raw);
}

export { MAX_COMMENT_IMAGES };
