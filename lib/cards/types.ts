export type CardBadgeVariant = "amber" | "violet" | "overlay" | "dark";

/** Presentational card data — decoupled from Firestore shapes. */
export type ContentCardModel = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  badge?: string;
  badgeVariant?: CardBadgeVariant;
  region?: string;
  views?: number;
  travelTime?: string;
  /** Preformatted secondary meta (e.g. "8 phút đọc · Jan 2025"). */
  metaLine?: string;
};

export type DestinationCardModel = {
  href: string;
  name: string;
  image?: string;
  views?: number;
};
