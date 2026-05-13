/**
 * Trang đăng bài viết du lịch (rich text + ảnh, gửi lên Firestore/Storage).
 *
 * Logic chi tiết nằm trong `CreatePostClient`; trang chỉ mount component client.
 */
"use client";

import CreatePostClient from "@/components/create-post/CreatePostClient";

export default function CreatePostPage() {
  return <CreatePostClient />;
}
