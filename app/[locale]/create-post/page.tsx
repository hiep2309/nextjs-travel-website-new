/**
 * Trang đăng bài viết du lịch (rich text + ảnh, gửi lên Firestore/Storage).
 */
"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CreatePostClient from "@/components/create-post/CreatePostClient";

function CreatePostFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center pt-24 text-white">
      <Loader2 className="size-8 animate-spin text-violet-400" aria-hidden />
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<CreatePostFallback />}>
      <CreatePostClient />
    </Suspense>
  );
}
