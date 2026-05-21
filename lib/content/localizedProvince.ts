/**
 * Localized province name/summary — static catalog (not Firestore).
 * Vietnamese `name` remains the canonical slug key.
 */
import type { AppLocale } from "@/i18n/routing";
import { regionLabelFallback } from "@/lib/regionLabels";
import type { LocalizedString } from "@/lib/i18n/types";
import type { ProvinceDef } from "@/lib/vietnamProvinces";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { getTranslation } from "@/lib/getTranslation";

/** Romanized / common English names for 34 provinces. */
const PROVINCE_EN: Record<string, string> = {
  "Hà Nội": "Hanoi",
  "Thành phố Hồ Chí Minh": "Ho Chi Minh City",
  "Hải Phòng": "Hai Phong",
  "Đà Nẵng": "Da Nang",
  "Cần Thơ": "Can Tho",
  Huế: "Hue",
  "An Giang": "An Giang",
  "Bắc Ninh": "Bac Ninh",
  "Cà Mau": "Ca Mau",
  "Cao Bằng": "Cao Bang",
  "Đắk Lắk": "Dak Lak",
  "Đồng Nai": "Dong Nai",
  "Đồng Tháp": "Dong Thap",
  "Gia Lai": "Gia Lai",
  "Hà Tĩnh": "Ha Tinh",
  "Hưng Yên": "Hung Yen",
  "Khánh Hòa": "Khanh Hoa",
  "Lai Châu": "Lai Chau",
  "Lâm Đồng": "Lam Dong",
  "Lạng Sơn": "Lang Son",
  "Lào Cai": "Lao Cai",
  "Nghệ An": "Nghe An",
  "Ninh Bình": "Ninh Binh",
  "Phú Thọ": "Phu Tho",
  "Quảng Ngãi": "Quang Ngai",
  "Quảng Ninh": "Quang Ninh",
  "Quảng Trị": "Quang Tri",
  "Sơn La": "Son La",
  "Tây Ninh": "Tay Ninh",
  "Thái Nguyên": "Thai Nguyen",
  "Thanh Hóa": "Thanh Hoa",
  "Tuyên Quang": "Tuyen Quang",
  "Vĩnh Long": "Vinh Long",
  "Điện Biên": "Dien Bien",
};

const PROVINCE_KO: Record<string, string> = {
  "Hà Nội": "하노이",
  "Thành phố Hồ Chí Minh": "호치민",
  "Hải Phòng": "하이퐁",
  "Đà Nẵng": "다낭",
  "Cần Thơ": "껀터",
  Huế: "후에",
  "An Giang": "안장",
  "Bắc Ninh": "박닌",
  "Cà Mau": "까마우",
  "Cao Bằng": "까오방",
  "Đắk Lắk": "닥락",
  "Đồng Nai": "동나이",
  "Đồng Tháp": "동탑",
  "Gia Lai": "자라이",
  "Hà Tĩnh": "하틴",
  "Hưng Yên": "흥옌",
  "Khánh Hòa": "칸호아",
  "Lai Châu": "라이쩌우",
  "Lâm Đồng": "람동",
  "Lạng Sơn": "랑선",
  "Lào Cai": "라오까이",
  "Nghệ An": "응에안",
  "Ninh Bình": "닌빈",
  "Phú Thọ": "푸토",
  "Quảng Ngãi": "꽝응ai",
  "Quảng Ninh": "꽝닌",
  "Quảng Trị": "꽝찌",
  "Sơn La": "선라",
  "Tây Ninh": "떠이닌",
  "Thái Nguyên": "타이응uyen",
  "Thanh Hóa": "타인호아",
  "Tuyên Quang": "투옌꽝",
  "Vĩnh Long": "빈롱",
  "Điện Biên": "디엔 bien",
};

const SUMMARY_TEMPLATE: Record<AppLocale, (name: string) => string> = {
  vi: (name) => `Khám phá điểm đến, văn hóa và bài viết du lịch gợi ý tại ${name}.`,
  en: (name) => `Discover destinations, culture, and travel stories in ${name}.`,
  ko: (name) => `${name}의 여행지, 문화, 추천 여행 콘텐츠를 만나보세요.`,
};

export type LocalizedProvinceView = {
  name: string;
  region: string;
  summary: string;
  nameLocalized: LocalizedString;
  regionLocalized: LocalizedString;
  summaryLocalized: LocalizedString;
};

export function buildLocalizedProvinceFields(
  province: ProvinceDef,
  locale: AppLocale,
): LocalizedProvinceView {
  const viName = province.name;
  const enName = PROVINCE_EN[viName] ?? viName;
  const koName = PROVINCE_KO[viName] ?? enName;

  const nameLocalized: LocalizedString = { vi: viName, en: enName, ko: koName };
  const regionLocalized: LocalizedString = {
    vi: province.region,
    en: regionLabelFallback(province.region, "en"),
    ko: regionLabelFallback(province.region, "ko"),
  };
  const summaryLocalized: LocalizedString = {
    vi: province.summary || SUMMARY_TEMPLATE.vi(viName),
    en: SUMMARY_TEMPLATE.en(enName),
    ko: SUMMARY_TEMPLATE.ko(koName),
  };

  return {
    name: getTranslation(nameLocalized, locale),
    region: getTranslation(regionLocalized, locale),
    summary: getTranslation(summaryLocalized, locale),
    nameLocalized,
    regionLocalized,
    summaryLocalized,
  };
}

export function getLocalizedProvinceName(viName: string, locale: AppLocale): string {
  if (locale === "vi") return viName;
  if (locale === "en") return PROVINCE_EN[viName] ?? viName;
  return PROVINCE_KO[viName] ?? PROVINCE_EN[viName] ?? viName;
}

/** Score province relevance for site search (0 = no match). */
export function scoreProvinceSearch(
  province: ProvinceDef,
  query: string,
  locale: AppLocale,
): number {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;

  const loc = buildLocalizedProvinceFields(province, locale);
  const names = [province.name, loc.name, loc.nameLocalized.en, loc.nameLocalized.ko].filter(
    (v): v is string => Boolean(v),
  );
  const regions = [province.region, loc.region, loc.regionLocalized.en, loc.regionLocalized.ko].filter(
    (v): v is string => Boolean(v),
  );

  let score = 0;
  for (const raw of names) {
    const n = raw.toLowerCase();
    if (n === needle) score = Math.max(score, 100);
    else if (n.startsWith(needle)) score = Math.max(score, 80);
    else if (n.includes(needle)) score = Math.max(score, 60);
  }
  for (const raw of regions) {
    const r = raw.toLowerCase();
    if (r.includes(needle)) score = Math.max(score, 40);
  }
  return score;
}

export function findExactProvinceMatch(query: string, locale: AppLocale): ProvinceDef | undefined {
  const needle = query.trim().toLowerCase();
  if (!needle) return undefined;
  return VIETNAM_PROVINCES.find((p) => {
    const loc = buildLocalizedProvinceFields(p, locale);
    return [p.name, loc.name, loc.nameLocalized.en, loc.nameLocalized.ko]
      .filter((v): v is string => Boolean(v))
      .some((n) => n.toLowerCase() === needle);
  });
}
