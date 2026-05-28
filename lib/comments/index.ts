export type {
  Comment,
  CommentAuthor,
  CommentLikeRecord,
  CommentRecord,
  CommentReportRecord,
  CreateCommentInput,
  UpdateCommentInput,
} from "@/lib/comments/types";
export {
  COMMENTS_PAGE_SIZE,
  MAX_COMMENT_IMAGES,
  MAX_COMMENT_LENGTH,
} from "@/lib/comments/constants";
export {
  createComment,
  deleteComment,
  mapCommentDoc,
  reportComment,
  toggleCommentLike,
  topLevelCommentsQuery,
  uploadCommentImage,
} from "@/lib/comments/service";
