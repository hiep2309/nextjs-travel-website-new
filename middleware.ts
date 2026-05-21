/**
 * Locale middleware — prefix URLs (/vi | /en | /ko), detect language, persist choice.
 */
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  ...routing,
  localeDetection: true,
  /** Prefer saved cookie, then Accept-Language; fallback locale is `vi`. */
  alternateLinks: true,
});

export const config = {
  matcher: [
    // All routes except Next internals and static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
