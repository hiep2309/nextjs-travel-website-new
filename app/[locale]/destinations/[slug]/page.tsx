/**
 * Multilingual destination detail — `/[locale]/destinations/[slug]`
 */
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { getProvinceBySlug, provinceNameToSlug } from "@/lib/provinceSlug";
import { buildDestinationPageModel } from "@/lib/destinationPageModel";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { absoluteUrl } from "@/lib/siteUrl";
import DestinationDetailClient from "./DestinationDetailClient";

type Props = { params: { locale: string; slug: string } };

export function generateStaticParams() {
  const slugs = VIETNAM_PROVINCES.map((p) => ({ slug: provinceNameToSlug(p.name) }));
  return routing.locales.flatMap((locale) => slugs.map((s) => ({ locale, ...s })));
}

export async function generateMetadata({ params }: Props) {
  const locale = params.locale as AppLocale;
  if (!routing.locales.includes(locale)) return { robots: { index: false } };

  const p = getProvinceBySlug(params.slug);
  if (!p) return { title: "Not found", robots: { index: false } };

  const model = buildDestinationPageModel(p);
  const baseSlug = provinceNameToSlug(p.name);

  const meta = buildLocalizedMetadata({
    locale,
    path: "/destinations",
    slugs: { vi: baseSlug, en: baseSlug, ko: baseSlug },
    fallback: {
      title: `${model.headline} | VN Insight`,
      description: p.summary,
    },
  });

  const rawOg = p.image.trim();
  const ogImage = rawOg ? (rawOg.startsWith("http") ? rawOg : absoluteUrl(rawOg)) : null;
  if (ogImage) {
    meta.openGraph = {
      ...meta.openGraph,
      images: [{ url: ogImage, width: 1200, height: 630, alt: model.headline }],
    };
  }
  return meta;
}

export default function DestinationPage({ params }: Props) {
  const locale = params.locale as AppLocale;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const province = getProvinceBySlug(params.slug);
  if (!province) notFound();

  return <DestinationDetailClient province={province} />;
}
