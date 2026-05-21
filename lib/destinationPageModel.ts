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

export type ExperienceCard = { title: string; image: string };
export type CostRow = { item: string; price: string };
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
  views: number;
  rating: number;
  ratingCount: number;
  intro: string;
  whyCards: WhyCard[];
  experiences: ExperienceCard[];
  tips: string[];
  costs: CostRow[];
  quickInfo: {
    location: string;
    idealTime: string;
    estCost: string;
    suitability: string;
  };
  toc: TocItem[];
  gallery: string[];
  related: RelatedDestination[];
  starBreakdown: { star: number; pct: number }[];
};

function pseudoRand(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h) % max;
}

function formatCostRange(locale: AppLocale, min: number, max: number): string {
  if (locale === "vi") {
    return `${min.toLocaleString("vi-VN")} – ${max.toLocaleString("vi-VN")} ₫`;
  }
  return `${min.toLocaleString(locale === "ko" ? "ko-KR" : "en-US")} – ${max.toLocaleString(locale === "ko" ? "ko-KR" : "en-US")} VND`;
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
  const views = 800 + pseudoRand(slug + "v", 9200);
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

  const experiences: ExperienceCard[] = ["exp1", "exp2", "exp3", "exp4"].map((key) => ({
    title: t(key),
    image: heroImage,
  }));

  const tips = ["tip1", "tip2", "tip3", "tip4"].map((key) => t(key));

  const costs: CostRow[] = [
    {
      item: t("cost1Item"),
      price: formatCostRange(
        locale,
        50 + pseudoRand(p.name, 4) * 30,
        150 + pseudoRand(p.name + "x", 5) * 40,
      ),
    },
    {
      item: t("cost2Item"),
      price: formatCostRange(
        locale,
        120 + pseudoRand(p.name + "e", 8) * 25,
        400 + pseudoRand(p.name + "f", 6) * 50,
      ),
    },
    {
      item: t("cost3Item"),
      price: formatCostRange(
        locale,
        80 + pseudoRand(p.name + "g", 10) * 20,
        300 + pseudoRand(p.name + "h", 7) * 40,
      ),
    },
    {
      item: t("cost4Item"),
      price: formatCostRange(
        locale,
        200 + pseudoRand(p.name + "i", 5) * 100,
        800 + pseudoRand(p.name + "j", 4) * 100,
      ),
    },
  ];

  const quickInfo = {
    location: t("quickLocation", { name: localized.name, region: localized.region }),
    idealTime: t("quickIdealTime"),
    estCost: t("quickEstCost"),
    suitability: t("quickSuitability"),
  };

  const toc: TocItem[] = [
    { id: "gioi-thieu", label: t("tocIntro"), num: "01" },
    { id: "vi-sao", label: t("tocWhy"), num: "02" },
    { id: "trai-nghiem", label: t("tocExp"), num: "03" },
    { id: "kinh-nghiem", label: t("tocTips"), num: "04" },
    { id: "chi-phi", label: t("tocCost"), num: "05" },
    { id: "hinh-anh", label: t("tocGallery"), num: "06" },
  ];

  const gallery = [heroImage, heroImage, heroImage, heroImage];

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
    views,
    rating,
    ratingCount,
    intro,
    whyCards,
    experiences,
    tips,
    costs,
    quickInfo,
    toc,
    gallery,
    related,
    starBreakdown,
  };
}
