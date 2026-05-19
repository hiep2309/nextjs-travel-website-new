/**
 * Kiểu bài viết Firestore `posts` dùng chung client.
 */
import type { PostType } from "@/lib/postCategories";
import type { LocalizedString } from "@/lib/i18n/types";

export type TravelPost = {
  id: string;
  name?: LocalizedString | string;
  title?: LocalizedString | string;
  description?: LocalizedString | string;
  contentHtml?: LocalizedString | string;
  image?: string;
  region?: string;
  country?: string;
  category?: string;
  postType?: PostType | string;
  travelTime?: string;
  createdAt?: { seconds?: number };
  viewCount?: number;
  status?: "pending" | "approved" | "rejected" | string;
  authorId?: string;
};
