/** CDN ảnh (images.unsplash.com đã khai trong next.config.js) */
export const TRAVEL_IMAGE_URLS = {
  terraces: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80",
  landscape: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80",
  boats: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80",
  oldTown: "https://images.unsplash.com/photo-1583417319070-08ee3d0dde43?auto=format&fit=crop&w=900&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  mountains: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  /** Lều cắm trại / hồ — dùng cho showcase Đà Nẵng (mockup trang chủ) */
  tentLake: "https://images.unsplash.com/photo-1504280390667-24c66113af35?auto=format&fit=crop&w=1200&q=80",
} as const;

export const TRAVEL_IMAGE_ROTATION: string[] = [
  TRAVEL_IMAGE_URLS.terraces,
  TRAVEL_IMAGE_URLS.landscape,
  TRAVEL_IMAGE_URLS.boats,
  TRAVEL_IMAGE_URLS.oldTown,
  TRAVEL_IMAGE_URLS.beach,
];
