/**
 * Chi tiết bài viết — `/posts/[id]`.
 * Metadata động (SEO / Open Graph) lấy từ Firestore phía server; UI tương tác ở `PostDetailClient`.
 */
import type { Metadata } from "next";
import PostDetailClient from "./PostDetailClient";
import { getPostSeoMeta } from "@/lib/firestoreServer";
import { absoluteUrl } from "@/lib/siteUrl";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = await getPostSeoMeta(params.id);
  if (!meta) {
    return {
      title: "Bài viết | VietNam Insight",
      description: "Chi tiết bài viết du lịch trên VietNam Insight.",
      robots: { index: false, follow: true },
    };
  }
  const title = `${meta.title} | VietNam Insight`;
  const ogImage =
    meta.image && meta.image.startsWith("http") ? meta.image : absoluteUrl("/signup_pic.jpg");
  return {
    title,
    description: meta.description,
    robots: meta.robotsNoIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: meta.description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
      images: [ogImage],
    },
  };
}

export default function PostPage() {
  return <PostDetailClient />;
}
