/**
 * Đọc Firestore từ Server Components / `generateMetadata` (không phải `use client`).
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebaseConfig";
import { normalizeTravelPost } from "@/lib/firestore/multilingual";
import { getTranslation, getTranslationSeo } from "@/lib/getTranslation";
import { resolveArticleTranslation } from "@/lib/posts/articleTranslations";
import type { AppLocale } from "@/i18n/routing";
import type { LocalizedString } from "@/lib/i18n/types";

function getServerDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

export type PostSeoMeta = {
  title: LocalizedString;
  description: LocalizedString;
  titleLegacy?: string;
  descriptionLegacy?: string;
  slugs?: import("@/lib/i18n/types").LocalizedSlug;
  seo?: import("@/lib/i18n/types").LocalizedSeo;
  image?: string;
  robotsNoIndex: boolean;
};

export async function getPostSeoMeta(id: string, locale?: AppLocale): Promise<PostSeoMeta | null> {
  if (!id) return null;
  try {
    const snap = await getDoc(doc(getServerDb(), "posts", id));
    if (!snap.exists()) return null;
    const post = normalizeTravelPost(snap.id, snap.data() as Record<string, unknown>);
    const loc = locale ?? "vi";
    const article = resolveArticleTranslation(post, loc);
    const seoEntry = getTranslationSeo(post.seo, loc);
    const titleLegacy = article.title || getTranslation(post.title, loc) || "Bài viết";
    const descriptionLegacy =
      seoEntry.description ||
      article.description ||
      getTranslation(post.description, loc).replace(/\s+/g, " ").trim().slice(0, 280) ||
      `${titleLegacy} — VN Insight`;

    const status = post.status ?? "";
    const robotsNoIndex =
      status === "pending" || status === "draft" || status === "rejected" || status === "deleted";

    return {
      title: post.title,
      description: post.description,
      titleLegacy,
      descriptionLegacy,
      slugs: post.slugs,
      seo: post.seo,
      image: post.image?.startsWith("http") ? post.image : undefined,
      robotsNoIndex,
    };
  } catch {
    return null;
  }
}
