"use client";

import { useTranslations } from "next-intl";
import type { PostType, PostSection, GuideChipKey } from "@/lib/postCategories";
import { POST_TYPES_BY_SECTION, sectionForPostType } from "@/lib/postCategories";

/** Client-side post type / section labels from messages. */
export function usePostTypeLabels() {
  const t = useTranslations("PostTypes");
  const tSection = useTranslations("PostSections");
  const tChips = useTranslations("GuideChips");

  return {
    label: (type: PostType) => t(`${type}.label`),
    shortLabel: (type: PostType) => t(`${type}.short`),
    description: (type: PostType) => t(`${type}.description`),
    sectionLabel: (section: PostSection) => tSection(section),
    chipLabel: (chip: GuideChipKey) => tChips(chip),
    navSectionLabel: (section: PostSection) => {
      const group = POST_TYPES_BY_SECTION.find((g) => g.section === section);
      return group ? tSection(section) : section;
    },
    sectionForType: sectionForPostType,
  };
}
