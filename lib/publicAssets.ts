/**
 * Static asset paths under `public/`.
 *
 * Layout:
 *   public/icons/        — logos & UI glyphs
 *   public/heroes/       — full-page backgrounds & auth imagery
 *   public/destinations/ — province / landmark photos
 *   public/foods/        — dish photos (local; optional — Food Explorer may use CDN)
 */

export const PUBLIC_ICONS = {
  logo: "/icons/logo.png",
  brand: "/icons/VN_Insight_logo.png",
  plane: "/icons/plane.png",
  star: "/icons/star.png",
} as const;

export const PUBLIC_HEROES = {
  appBackground: "/heroes/signup_pic.jpg",
  login: "/heroes/login_pic.jpg",
  halong: "/heroes/halong_background.jpg",
  landscape: "/heroes/phong_canh.jpg",
} as const;

/** Default cover when a post or itinerary has no image. */
export const DEFAULT_COVER_IMAGE = PUBLIC_HEROES.appBackground;

/** Province / landmark file name (must exist under `public/destinations/`). */
export function destImage(filename: string): string {
  const name = filename.replace(/^\/+/, "").replace(/^destinations\//, "");
  return `/destinations/${encodeURI(name)}`;
}

/** Food asset file name under `public/foods/`. */
export function foodImage(filename: string): string {
  const name = filename.replace(/^\/+/, "").replace(/^foods\//, "");
  return `/foods/${name}`;
}
