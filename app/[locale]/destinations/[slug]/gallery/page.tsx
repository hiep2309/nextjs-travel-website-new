/**
 * Gallery of images from approved posts tagged with this province.
 */
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildLocalizedProvinceFields } from "@/lib/content/localizedProvince";
import { buildDestinationPageModel } from "@/lib/destinationPageModel";
import { initPageLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { getProvinceBySlug, provinceNameToSlug } from "@/lib/provinceSlug";
import { routing, type AppLocale } from "@/i18n/routing";
import DestinationGalleryClient from "./DestinationGalleryClient";

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Props) {
  const locale = params.locale as AppLocale;
  if (!routing.locales.includes(locale)) return { robots: { index: false } };

  const p = getProvinceBySlug(params.slug);
  if (!p) return { title: "Not found", robots: { index: false } };

  const t = await getTranslations({ locale, namespace: "Destinations" });
  const localized = buildLocalizedProvinceFields(p, locale);
  const model = buildDestinationPageModel(p, locale, t, localized);
  const baseSlug = provinceNameToSlug(p.name);

  return buildLocalizedMetadata({
    locale,
    path: "/destinations",
    slugs: { vi: `${baseSlug}/gallery`, en: `${baseSlug}/gallery`, ko: `${baseSlug}/gallery` },
    fallback: {
      title: `${t("gallery")} — ${model.headline} | VN Insight`,
      description: localized.summary,
    },
  });
}

export default function DestinationGalleryPage({ params }: Props) {
  initPageLocale(params.locale);

  const province = getProvinceBySlug(params.slug);
  if (!province) notFound();

  return <DestinationGalleryClient province={province} />;
}
