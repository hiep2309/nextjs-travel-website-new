/**
 * Multilingual architecture — public API.
 *
 * UI strings  → next-intl (`useTranslations`, `getTranslations`)
 * DB content  → `getTranslation()` from `@/lib/getTranslation`
 */
export * from "./types";
export * from "./content";
export * from "./metadata";
export * from "./pageMetadata";
export * from "./server";
export * from "../translation";
export { Link, redirect, usePathname, useRouter, getPathname } from "./navigation";
