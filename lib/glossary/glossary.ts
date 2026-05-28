import type { AppLocale } from "@/i18n/routing";

/** Extended targets supported by Gemini (ja = future locale). */
export type ExtendedTargetLocale = AppLocale | "ja";

type GlossaryEntry = Partial<Record<ExtendedTargetLocale, string>>;

/**
 * Curated Vietnam travel terminology — injected into Gemini prompts.
 * Keys are Vietnamese (or common source) phrases; values are natural tourist-facing wording.
 */
export const TRAVEL_GLOSSARY: Record<string, GlossaryEntry> = {
  // — Platform & content types —
  "Review địa điểm": { ko: "현지 스팟 리뷰", en: "local spot review", ja: "現地スポットレビュー" },
  "Cẩm nang du lịch": { ko: "베트남 여행 가이드", en: "Vietnam travel guide", ja: "ベトナム旅行ガイド" },
  "Chia sẻ tour": { ko: "투어 후기", en: "tour recap", ja: "ツアー体験記" },
  "Dân bản địa": { ko: "현지인", en: "locals", ja: "地元の人" },
  "theo kinh nghiệm của": { ko: "현지인 추천", en: "local tips from", ja: "地元のおすすめ" },

  // — Travel styles —
  "Du lịch bụi": { ko: "배낭여행", en: "backpacking", ja: "バックパッキング" },
  "Du lịch tiết kiệm": { ko: "알뜰 여행", en: "budget travel", ja: "節約旅行" },
  "Du lịch sinh viên": { ko: "학생 여행", en: "student travel", ja: "学生旅行" },
  "Đi phượt": { ko: "배낭여행", en: "backpacking trip", ja: "バックパック旅行" },
  "Lịch trình": { ko: "여행 일정", en: "itinerary", ja: "旅程" },
  "Hành trình": { ko: "여행 코스", en: "journey", ja: "旅の行程" },

  // — Food & cafés —
  "Ẩm thực đường phố": { ko: "길거리 음식", en: "street food", ja: "屋台料理" },
  "Ẩm thực": { ko: "현지 음식", en: "local cuisine", ja: "現地料理" },
  "Quán cà phê": { ko: "카페", en: "café", ja: "カフェ" },
  "Quán ăn": { ko: "맛집", en: "local eatery", ja: "食堂" },
  "Món ngon": { ko: "현지 맛집 메뉴", en: "must-try dish", ja: "名物料理" },
  "Đặc sản": { ko: "지역 특산 요리", en: "local specialty", ja: "名物" },
  "Bánh đa cua": { ko: "게 국수(반 다 쿠아)", en: "crab noodle soup (banh da cua)", ja: "カニ麺（バンダクア）" },
  "Phở": { ko: "쌀국수(포)", en: "pho", ja: "フォー" },
  "Bún chả": { ko: "분짜", en: "bun cha", ja: "ブンチャー" },
  "Cơm tấm": { ko: "껌탐(베트남식 돼지고기 밥)", en: "com tam", ja: "コムタム" },

  // — Hidden gems & sightseeing —
  "Điểm đến ít người biết": { ko: "숨은 명소", en: "hidden gem", ja: "穴場スポット" },
  "Ít người biết": { ko: "숨은", en: "off-the-beaten-path", ja: "穴場の" },
  "Check-in": { ko: "포토 스팟", en: "photo spot", ja: "フォトスポット" },
  "Sống ảo": { ko: "인생샷 명소", en: "Instagram-worthy spot", ja: "映えスポット" },
  "Tham quan": { ko: "관광", en: "sightseeing", ja: "観光" },
  "Khám phá": { ko: "탐험하기", en: "explore", ja: "探索する" },
  "Phố cổ": { ko: "올드타운", en: "old quarter", ja: "旧市街" },

  // — Transport & practical —
  "Di chuyển": { ko: "이동", en: "getting around", ja: "移動" },
  "Thuê xe máy": { ko: "오토바이 렌트", en: "motorbike rental", ja: "バイクレンタル" },
  "Grab": { ko: "그랩", en: "Grab", ja: "Grab" },
  "Khách sạn": { ko: "호텔", en: "hotel", ja: "ホテル" },
  "Homestay": { ko: "홈스테이", en: "homestay", ja: "ホームステイ" },
  "Nhận phòng": { ko: "체크인", en: "check-in", ja: "チェックイン" },
  "Buổi sáng": { ko: "오전", en: "morning", ja: "午前" },
  "Buổi trưa": { ko: "점심", en: "midday", ja: "昼" },
  "Buổi tối": { ko: "저녁", en: "evening", ja: "夕方・夜" },

  // — Places (recognizable + natural in target language) —
  "Hà Nội": { ko: "하노이", en: "Hanoi", ja: "ハノイ" },
  "Hải Phòng": { ko: "하이퐁", en: "Hai Phong", ja: "ハイフォン" },
  "Hạ Long": { ko: "하롱", en: "Ha Long", ja: "ハロン" },
  "Vịnh Hạ Long": { ko: "하롱베이", en: "Ha Long Bay", ja: "ハロン湾" },
  "Đà Nẵng": { ko: "다낭", en: "Da Nang", ja: "ダナン" },
  "Hội An": { ko: "호이안", en: "Hoi An", ja: "ホイアン" },
  "Huế": { ko: "후에", en: "Hue", ja: "フエ" },
  "Sa Pa": { ko: "사파", en: "Sa Pa", ja: "サパ" },
  "Ninh Bình": { ko: "닌빈", en: "Ninh Binh", ja: "ニンビン" },
  "Phú Quốc": { ko: "푸꾸옥", en: "Phu Quoc", ja: "フーコック" },
  "Mộc Châu": { ko: "목쩌우", en: "Moc Chau", ja: "モクチャウ" },
  "Hà Giang": { ko: "하장", en: "Ha Giang", ja: "ハザン" },
};

const LOCALE_LABEL: Record<ExtendedTargetLocale, string> = {
  vi: "Vietnamese",
  en: "English",
  ko: "Korean",
  ja: "Japanese",
};

/** Locale-specific tone — avoids literal/word-for-word machine translation. */
const LOCALIZATION_STYLE: Partial<Record<ExtendedTargetLocale, string>> = {
  ko: `
Audience: Korean tourists and students visiting Vietnam (VN Insight).
Tone: friendly travel blog — polite but conversational (~해요 / ~합니다). Not stiff news style.
Style:
- Prefer natural Korean travel phrasing over literal translation from Vietnamese.
- Use established terms: 현지 맛집, 숨은 명소, 배낭여행, 알뜰 여행, 여행 코스, 포토 스팟.
- Short, scannable sentences; break long Vietnamese sentences into readable Korean.
- Keep dish/place names recognizable; add brief Korean gloss in parentheses only when helpful.
- Avoid awkward Konglish or word-for-word calques (e.g. avoid "여행지 리뷰" when "현지 스팟 리뷰" fits better).
- Write like a Korean travel creator recommending Vietnam — warm, practical, trustworthy.`,

  en: `
Audience: International travelers discovering Vietnam (VN Insight).
Tone: engaging travel blog — clear, inviting, practical. Not encyclopedic.
Style:
- Natural English for tourism (hidden gems, local eats, must-try, getting around).
- Prefer active voice and short paragraphs; easy to skim on mobile.
- Keep Vietnamese place and food names with brief context when first mentioned.
- Avoid stiff literal translation; sound like a knowledgeable friend, not a dictionary.`,

  ja: `
Audience: Japanese travelers in Vietnam (VN Insight).
Tone: polite, informative travel guide (~です／~ます).
Style:
- Natural Japanese tourism phrasing; avoid direct Vietnamese sentence structure.
- Use common travel terms: 現地グルメ, 穴場, 観光, 宿探し.
- Keep place and dish names recognizable with standard Japanese exonyms where common.`,
};

export function localeLabel(locale: ExtendedTargetLocale): string {
  return LOCALE_LABEL[locale] ?? locale;
}

/** Preferred terminology table for the prompt. */
export function buildGlossaryPrompt(from: AppLocale, to: ExtendedTargetLocale): string {
  const lines: string[] = [];
  for (const [source, targets] of Object.entries(TRAVEL_GLOSSARY)) {
    const preferred = targets[to];
    if (preferred) {
      lines.push(`- "${source}" → "${preferred}"`);
    }
  }
  if (lines.length === 0) return "";
  return `
Preferred terminology (use when the source phrase appears — adapt naturally to context):
${lines.join("\n")}`;
}

/** Target-locale writing style for natural tourist-facing copy. */
export function buildLocalizationStylePrompt(to: ExtendedTargetLocale): string {
  return LOCALIZATION_STYLE[to] ?? "";
}

/** Platform context shared across all translation calls. */
export function buildPlatformContextPrompt(): string {
  return `
Platform: VN Insight — AI travel platform focused on Vietnam tourism, local food, hidden places,
student/budget travel, and Korean & international visitors.
Goal: Translations must read like original travel content for tourists — NOT literal machine output.`;
}
