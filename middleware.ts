/**
 * Locale middleware — auto-detect browser language, prefix URLs with /vi | /en | /ko.
 */
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  ...routing,
  localeDetection: true,
});

export const config = {
  matcher: [
    // All routes except Next internals and static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
