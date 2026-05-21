/**
 * Quyền chỉnh sửa / xóa bài viết theo vai trò và trạng thái.
 */
export function canDeletePost(
  role: string | null | undefined,
  uid: string | null | undefined,
  authorId?: string | null,
): boolean {
  if (!uid) return false;
  if (role === "admin") return true;
  return Boolean(authorId && authorId === uid);
}

export function canEditPost(
  role: string | null | undefined,
  uid: string | null | undefined,
  authorId?: string | null,
  status?: string | null,
): boolean {
  if (!uid) return false;
  if (role === "admin") return true;
  return Boolean(authorId && authorId === uid && status === "pending");
}
