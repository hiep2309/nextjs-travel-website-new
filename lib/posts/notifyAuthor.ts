import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { pickLocalized } from "@/lib/i18n/content";
import type { LocalizedString } from "@/lib/i18n/types";

export type PostApprovedNotification = {
  userId: string;
  type: "post_approved";
  postId: string;
  title: string;
  read: boolean;
  createdAt: ReturnType<typeof serverTimestamp>;
};

/** Gửi thông báo cho tác giả khi admin duyệt bài. */
export async function notifyPostApproved(params: {
  authorId: string;
  postId: string;
  title?: LocalizedString | string | null;
  name?: LocalizedString | string | null;
}): Promise<void> {
  const { authorId, postId, title, name } = params;
  if (!authorId?.trim()) return;

  const displayTitle =
    pickLocalized(title ?? name, "vi") ||
    (typeof title === "string" ? title : "") ||
    pickLocalized(name, "vi") ||
    (typeof name === "string" ? name : "") ||
    "Bài viết";

  await addDoc(collection(db, "notifications"), {
    userId: authorId,
    type: "post_approved",
    postId,
    title: displayTitle,
    read: false,
    createdAt: serverTimestamp(),
  } satisfies Omit<PostApprovedNotification, "createdAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
  });
}
