/**
 * Cấu trúc collection Firestore hiện tại + gợi ý mở rộng (scale blog/du lịch).
 *
 * **Đang dùng**
 * - `users/{uid}` — profile, `role` (admin | …)
 * - `posts/{id}` — bài viết (`status`, `contentHtml`, `image`, `viewCount`, …)
 *
 * **Gợi ý sau này** (chưa bắt buộc triển khai):
 * - `locations/{id}` — POI chuẩn hóa (slug, geo, gallery) thay vì chỉ chuỗi `region` trên post
 * - `tags/{slug}` hoặc mảng `tags[]` + index — lọc nâng cao
 * - `tours/{id}` — tour bookable
 * - `comments/{id}` — subcollection `posts/{postId}/comments`
 * - `favorites/{uid}/items` — sync cloud thay vì chỉ localStorage
 *
 * Rules: `firestore.rules` — cập nhật khi thêm collection mới.
 */
export const COLLECTIONS = {
  users: "users",
  posts: "posts",
} as const;
