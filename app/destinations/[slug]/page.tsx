/**
 * Route động chi tiết địa điểm theo tỉnh — `/destinations/[slug]`.
 *
 * Chức năng:
 * - `generateStaticParams`: pre-render 53 tỉnh từ `VIETNAM_PROVINCES`.
 * - `generateMetadata`: SEO title/description.
 * - Render `DestinationDetailClient` với model xây từ `buildDestinationPageModel`.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { getProvinceBySlug, provinceNameToSlug } from "@/lib/provinceSlug";
import { buildDestinationPageModel } from "@/lib/destinationPageModel";
import DestinationDetailClient from "./DestinationDetailClient";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return VIETNAM_PROVINCES.map((p) => ({ slug: provinceNameToSlug(p.name) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const p = getProvinceBySlug(params.slug);
  if (!p) return { title: "Không tìm thấy | VN Insight" };
  const model = buildDestinationPageModel(p);
  return {
    title: `${model.headline} | VN Insight`,
    description: p.summary,
  };
}

export default function DestinationPage({ params }: Props) {
  const province = getProvinceBySlug(params.slug);
  if (!province) notFound();
  return <DestinationDetailClient province={province} />;
}
