/**
 * Kiểu bài viết Firestore `posts`.
 *
 * Canonical article copy → `translations.{vi|en|ko}.{title, content}`
 * `title`, `description`, `contentHtml` maps are derived on read for search/SEO.
 */
import type { PostType } from "@/lib/postCategories";
import type {
  LocalizedDocumentBase,
  LocalizedHtml,
  LocalizedString,
  LegacyPostFields,
  PostTranslations,
} from "@/lib/i18n/types";
import type { ArticleSection } from "@/lib/posts/articleSections";

export type TravelPost = LocalizedDocumentBase &
  LegacyPostFields & {
    id: string;
    /** Derived from `translations` on read — not the write source of truth. */
    title: LocalizedString;
    description: LocalizedString;
    contentHtml: LocalizedHtml;
    translations?: PostTranslations;
    /**
     * Structured, language-neutral body. Layout is shared across locales; only
     * block text changes per language. Always populated on read (stored or
     * derived from `contentHtml`). Preferred over `contentHtml` for rendering.
     */
    sections?: ArticleSection[];
    sectionsVersion?: number;
    image?: string;
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
