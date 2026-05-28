import type { Timestamp } from "firebase/firestore";

/** Firestore `comments/{id}` document shape. */
export type CommentRecord = {
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  images: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likeCount: number;
  replyCount: number;
  parentId: string | null;
  isEdited: boolean;
  /** User being replied to (Facebook-style @mention). */
  replyToUserId?: string | null;
  replyToUsername?: string | null;
};

export type Comment = CommentRecord & { id: string };

/** Firestore `commentLikes/{id}` — id = `{commentId}_{userId}`. */
export type CommentLikeRecord = {
  commentId: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
};

/** Firestore `commentReports/{id}`. */
export type CommentReportRecord = {
  commentId: string;
  postId: string;
  reporterId: string;
  reason: string;
  createdAt: Timestamp;
  status: "pending" | "reviewed";
};

export type CommentAuthor = {
  uid: string;
  username: string;
  userAvatar: string;
};

export type ReplyTarget = {
  userId: string;
  username: string;
};

export type CreateCommentInput = {
  postId: string;
  content: string;
  images?: string[];
  parentId?: string | null;
  replyTo?: ReplyTarget | null;
  author: CommentAuthor;
};

export type UpdateCommentInput = {
  commentId: string;
  postId: string;
  content: string;
  images?: string[];
};
