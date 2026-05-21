/**
 * Chi tiết bài viết — `/posts/[id]`.
 * Metadata động (SEO / Open Graph) lấy từ Firestore phía server; UI tương tác ở `PostDetailClient`.
 */
import type { Metadata } from "next";
import PostDetailClient from "./PostDetailClient";
import { getPostSeoMeta } from "@/lib/firestoreServer";
import { absoluteUrl } from "@/lib/siteUrl";
import { initPageLocale, isAppLocale } from "@/lib/i18n/server";
import { getTranslation } from "@/lib/getTranslation";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";

type Props = { params: { locale: string; id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isAppLocale(params.locale)) return {};
  const locale = params.locale;
  initPageLocale(locale);
  const meta = await getPostSeoMeta(params.id, locale);
  if (!meta) {
    return buildLocalizedMetadata({
      locale,
      path: `/posts/${params.id}`,
      fallback: {
        title: "Post | VN Insight",
        description: "",
      },
    });
  }

  const title = getTranslation(meta.title, locale) || meta.titleLegacy || "Post";
  const description = getTranslation(meta.description, locale) || meta.descriptionLegacy || "";

  const seoMeta = buildLocalizedMetadata({
    locale,
    path: `/posts/${params.id}`,
    fallback: { title: `${title} | VN Insight`, description },
  });

  const ogImage =
    meta.image && meta.image.startsWith("http") ? meta.image : absoluteUrl("/signup_pic.jpg");
  return {
    ...seoMeta,
    robots: meta.robotsNoIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      ...seoMeta.openGraph,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | VN Insight`,
      description,
      images: [ogImage],
    },
  };
}

export default function PostPage({ params }: Props) {
  initPageLocale(params.locale);
  return <PostDetailClient postId={params.id} />;
}
