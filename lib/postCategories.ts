/**
 * Phân loại bài viết cộng đồng — map tới Destinations / Tours / Guides trên navbar.
 */
export type PostType =
  | "destination_review"
  | "tour_share"
  | "guide_handbook"
  | "guide_hotel"
  | "guide_notes"
  | "guide_transport";

export type PostSection = "destinations" | "tours" | "guides";

export type GuideChipKey = "all" | "handbook" | "hotel" | "notes" | "transport";

export const POST_TYPE_META: Record<
  PostType,
  { label: string; shortLabel: string; section: PostSection; guideChip?: GuideChipKey }
> = {
  destination_review: {
    label: "Review địa điểm",
    shortLabel: "Review",
    section: "destinations",
  },
  tour_share: {
    label: "Chia sẻ tour",
    shortLabel: "Tour",
    section: "tours",
  },
  guide_handbook: {
    label: "Cẩm nang du lịch",
    shortLabel: "Cẩm nang",
    section: "guides",
    guideChip: "handbook",
  },
  guide_hotel: {
    label: "Mẹo đặt khách sạn",
    shortLabel: "Khách sạn",
    section: "guides",
    guideChip: "hotel",
  },
  guide_notes: {
    label: "Điểm chú ý",
    shortLabel: "Lưu ý",
    section: "guides",
    guideChip: "notes",
  },
  guide_transport: {
    label: "Cách di chuyển",
    shortLabel: "Di chuyển",
    section: "guides",
    guideChip: "transport",
  },
};

/** Gợi ý ngắn khi user chọn loại bài lúc đăng. */
export const POST_TYPE_DESCRIPTIONS: Record<PostType, string> = {
  destination_review: "Review, đánh giá và trải nghiệm thực tế tại một địa điểm.",
  tour_share: "Chia sẻ tour, lịch trình, chi phí và gợi ý hành trình.",
  guide_handbook: "Cẩm nang tổng hợp: ẩm thực, văn hóa, lịch trình gợi ý.",
  guide_hotel: "Mẹo đặt phòng, homestay, resort theo ngân sách.",
  guide_notes: "Điểm cần chú ý, mùa đẹp, tránh rủi ro khi đi.",
  guide_transport: "Cách di chuyển: xe, tàu, máy bay, thuê xe.",
};

export const SECTION_NAV: Record<PostSection, { href: string; label: string }> = {
  destinations: { href: "/explore", label: "Destinations" },
  tours: { href: "/tours", label: "Tours" },
  guides: { href: "/guides", label: "Guides" },
};

export function publicPageForPostType(type: PostType) {
  return SECTION_NAV[sectionForPostType(type)];
}

export const ALL_POST_TYPES: PostType[] = (
  Object.keys(POST_TYPE_META) as PostType[]
);

export const POST_TYPES_BY_SECTION: { section: PostSection; label: string; types: PostType[] }[] = [
  {
    section: "destinations",
    label: "Địa điểm",
    types: ["destination_review"],
  },
  {
    section: "tours",
    label: "Tour",
    types: ["tour_share"],
  },
  {
    section: "guides",
    label: "Cẩm nang",
    types: ["guide_handbook", "guide_hotel", "guide_notes", "guide_transport"],
  },
];

export const GUIDE_CATEGORY_CHIPS: { key: GuideChipKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "handbook", label: "Cẩm nang" },
  { key: "hotel", label: "Đặt khách sạn" },
  { key: "notes", label: "Điểm chú ý" },
  { key: "transport", label: "Di chuyển" },
];

const LEGACY_CATEGORY_TO_TYPE: Record<string, PostType> = {
  "khám phá": "destination_review",
  "ẩm thực": "guide_handbook",
  "nghỉ dưỡng": "guide_hotel",
  "văn hóa": "guide_handbook",
  "sinh thái": "destination_review",
  "phiêu lưu": "destination_review",
  "khác": "destination_review",
  "điểm đến": "destination_review",
  "kinh nghiệm": "guide_handbook",
  "hướng dẫn": "guide_handbook",
};

function isPostType(v: string): v is PostType {
  return v in POST_TYPE_META;
}

/** Chuẩn hóa `postType` / `category` cũ → loại bài hiện tại. */
export function resolvePostType(post: { postType?: string; category?: string }): PostType {
  const raw = (post.postType || "").trim();
  if (raw && isPostType(raw)) return raw;

  const cat = (post.category || "").trim().toLowerCase();
  if (cat && LEGACY_CATEGORY_TO_TYPE[cat]) return LEGACY_CATEGORY_TO_TYPE[cat];

  return "destination_review";
}

export function labelForPostType(type: PostType): string {
  return POST_TYPE_META[type].label;
}

export function shortLabelForPostType(type: PostType): string {
  return POST_TYPE_META[type].shortLabel;
}

export function sectionForPostType(type: PostType): PostSection {
  return POST_TYPE_META[type].section;
}

export function postBelongsToSection(
  post: { postType?: string; category?: string },
  section: PostSection,
): boolean {
  return sectionForPostType(resolvePostType(post)) === section;
}

export function postMatchesGuideChip(
  post: { postType?: string; category?: string },
  chip: GuideChipKey,
): boolean {
  if (chip === "all") return postBelongsToSection(post, "guides");
  const type = resolvePostType(post);
  return POST_TYPE_META[type].guideChip === chip;
}

export function labelForGuideChip(chip: GuideChipKey): string {
  return GUIDE_CATEGORY_CHIPS.find((c) => c.key === chip)?.label ?? chip;
}
