/**
 * Xây model hiển thị cho trang chi tiết địa điểm — locale-aware via next-intl Destinations namespace.
 */
import type { AppLocale } from "@/i18n/routing";
import type { LocalizedProvinceView } from "@/lib/content/localizedProvince";
import { getLocalizedProvinceName } from "@/lib/content/localizedProvince";
import type { ProvinceDef } from "@/lib/vietnamProvinces";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { provinceNameToSlug } from "@/lib/provinceSlug";

const TITLE_OVERRIDE_VI: Partial<Record<string, string>> = {
  Huế: "Cố đô Huế — di sản & ẩm thực",
};

export type DestinationCopyFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export type WhyCard = {
  key: string;
  title: string;
  body: string;
  accent: "purple" | "pink" | "orange";
};

export type TocItem = { id: string; label: string; num: string };

export type RelatedDestination = {
  name: string;
  slug: string;
  image: string;
  views: number;
};

export type DestinationPageModel = {
  slug: string;
  headline: string;
  province: ProvinceDef;
  localized: LocalizedProvinceView;
  heroImage: string;
  readMinutes: number;
  rating: number;
  ratingCount: number;
  intro: string;
  whyCards: WhyCard[];
  tips: string[];
  quickInfo: {
    location: string;
    idealTime: string;
    suitability: string;
  };
  toc: TocItem[];
  related: RelatedDestination[];
  starBreakdown: { star: number; pct: number }[];
};

function pseudoRand(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h) % max;
}

export function buildDestinationPageModel(
  p: ProvinceDef,
  locale: AppLocale,
  t: DestinationCopyFn,
  localized: LocalizedProvinceView,
): DestinationPageModel {
  const slug = provinceNameToSlug(p.name);
  const headlineOverride = TITLE_OVERRIDE_VI[p.name];
  const headline = headlineOverride
    ? locale === "vi"
      ? headlineOverride
      : t("headlineHue", { name: localized.name })
    : t("headlineDefault", { name: localized.name });
  const heroImage = p.image;

  const readMinutes = 8 + (pseudoRand(p.name, 8) || 1);
  const rating = Math.min(5, 4.4 + pseudoRand(slug + "r", 7) / 10);
  const ratingCount = 120 + pseudoRand(slug + "c", 400);

  const intro = t("introBody", {
    name: localized.name,
    region: localized.region,
    summary: localized.summary,
  });

  const whyCards: WhyCard[] = [
    {
      key: "1",
      title: t("why1Title"),
      body: t("why1Body", { name: localized.name }),
      accent: "purple",
    },
    {
      key: "2",
      title: t("why2Title"),
      body: t("why2Body", { region: localized.region }),
      accent: "pink",
    },
    {
      key: "3",
      title: t("why3Title"),
      body: t("why3Body", { name: localized.name }),
      accent: "orange",
    },
  ];

  const tips = ["tip1", "tip2", "tip3", "tip4"].map((key) => t(key));

  const quickInfo = {
    location: t("quickLocation", { name: localized.name, region: localized.region }),
    idealTime: t("quickIdealTime"),
    suitability: t("quickSuitability"),
  };

  const toc: TocItem[] = [
    { id: "gioi-thieu", label: t("tocIntro"), num: "01" },
    { id: "vi-sao", label: t("tocWhy"), num: "02" },
    { id: "trai-nghiem", label: t("tocExp"), num: "03" },
    { id: "kinh-nghiem", label: t("tocTips"), num: "04" },
    { id: "hinh-anh", label: t("tocGallery"), num: "05" },
  ];

  const sameRegion = VIETNAM_PROVINCES.filter((x) => x.region === p.region && x.name !== p.name);
  const others = VIETNAM_PROVINCES.filter((x) => x.name !== p.name);
  const mix = [...sameRegion, ...others.filter((x) => !sameRegion.includes(x))];
  const related: RelatedDestination[] = mix.slice(0, 4).map((x, i) => ({
    name: getLocalizedProvinceName(x.name, locale),
    slug: provinceNameToSlug(x.name),
    image: x.image,
    views: 600 + pseudoRand(x.name + String(i), 8000),
  }));

  const starBreakdown = [
    { star: 5, pct: 62 + pseudoRand(slug + "5", 12) },
    { star: 4, pct: 22 + pseudoRand(slug + "4", 8) },
    { star: 3, pct: 8 + pseudoRand(slug + "3", 4) },
    { star: 2, pct: 3 + pseudoRand(slug + "2", 3) },
    { star: 1, pct: 2 + pseudoRand(slug + "1", 2) },
  ];
  const sum = starBreakdown.reduce((a, b) => a + b.pct, 0);
  starBreakdown.forEach((row) => {
    row.pct = Math.round((row.pct / sum) * 100);
  });

  return {
    slug,
    headline,
    province: p,
    localized,
    heroImage,
    readMinutes,
    rating,
    ratingCount,
    intro,
    whyCards,
    tips,
    quickInfo,
    toc,
    related,
    starBreakdown,
  };
}
