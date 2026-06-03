/**
 * Shared generateMetadata builders for static [locale] routes.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildLocalizedMetadata } from "./metadata";
import { initPageLocale, isAppLocale } from "./server";
import type { AppLocale } from "@/i18n/routing";

export type PageMetaConfig = {
  namespace: string;
  path: `/${string}`;
  titleKey?: string;
  descriptionKey?: string;
};

export const PAGE_META = {
  home: {
    namespace: "Meta",
    path: "/",
    titleKey: "defaultTitle",
    descriptionKey: "defaultDescription",
  },
  explore: {
    namespace: "Explore",
    path: "/explore",
    titleKey: "title",
    descriptionKey: "titleAll",
  },
  tours: {
    namespace: "Tours",
    path: "/tours",
    titleKey: "pageTitle",
    descriptionKey: "desc",
  },
  guides: {
    namespace: "GuidesPage",
    path: "/guides",
    titleKey: "title",
    descriptionKey: "desc",
  },
  aiPlanner: {
    namespace: "AiPlanner",
    path: "/ai-trip-planner",
    titleKey: "title",
    descriptionKey: "subtitle",
  },
  aiFood: {
    namespace: "FoodExplorer",
    path: "/ai-food-explorer",
    titleKey: "title",
    descriptionKey: "subtitle",
  },
  savedItineraries: {
    namespace: "SavedItineraries",
    path: "/saved-itineraries",
    titleKey: "title",
    descriptionKey: "subtitle",
  },
  createPost: {
    namespace: "CreatePost",
    path: "/create-post",
    titleKey: "title",
    descriptionKey: "subtitle",
  },
  profile: {
    namespace: "Profile",
    path: "/profile",
    titleKey: "title",
    descriptionKey: "title",
  },
  dashboard: {
    namespace: "Dashboard",
    path: "/dashboard",
    titleKey: "memberPage",
    descriptionKey: "memberHint",
  },
  login: {
    namespace: "Auth",
    path: "/login",
    titleKey: "loginTitle",
    descriptionKey: "welcomeBack",
  },
  register: {
    namespace: "Register",
    path: "/register",
    titleKey: "createAccount",
    descriptionKey: "startFree",
  },
} as const satisfies Record<string, PageMetaConfig>;

export async function generatePageMetadata(
  rawLocale: string,
  config: PageMetaConfig,
): Promise<Metadata> {
  if (!isAppLocale(rawLocale)) return {};

  const locale = rawLocale as AppLocale;
  initPageLocale(locale);

  const t = await getTranslations({ locale, namespace: config.namespace });
  const titleKey = config.titleKey ?? "title";
  const descriptionKey = config.descriptionKey ?? "description";

  let description = "";
  try {
    description = t(descriptionKey);
  } catch {
    try {
      description = t("desc");
    } catch {
      description = "";
    }
  }

  return buildLocalizedMetadata({
    locale,
    path: config.path,
    fallback: {
      title: t(titleKey),
      description,
    },
  });
}
