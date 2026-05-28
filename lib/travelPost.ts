/**
 * Kiểu bài viết Firestore `posts` — canonical multilingual shape.
 */
import type { PostType } from "@/lib/postCategories";
import type {
  LocalizedDocumentBase,
  LocalizedHtml,
  LocalizedString,
  LegacyPostFields,
  PostTranslations,
} from "@/lib/i18n/types";

export type TravelPost = LocalizedDocumentBase &
  LegacyPostFields & {
    id: string;
    title: LocalizedString;
    description: LocalizedString;
    contentHtml: LocalizedHtml;
    translations?: PostTranslations;    image?: string;
    images?: string[];
    thumb?: string;
    region?: string;
    regionKey?: string;
    country?: string;
    category?: string;
    postType?: PostType | string;
    travelTime?: string;
    tags?: string[];
    createdAt?: { seconds?: number };
    viewCount?: number;
    commentCount?: number;
    status?: "pending" | "approved" | "rejected" | string;
    authorId?: string;
    authorName?: string;
    number?: number;
  };

