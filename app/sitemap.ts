import type { MetadataRoute } from "next";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { provinceNameToSlug } from "@/lib/provinceSlug";
import { getSiteUrl } from "@/lib/siteUrl";
import { locales } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  const staticPaths = ["", "/explore", "/guides", "/tours", "/login", "/register", "/create-post"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.75,
      });
    }
    for (const p of VIETNAM_PROVINCES) {
      entries.push({
        url: `${base}/${locale}/destinations/${provinceNameToSlug(p.name)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  return entries;
}
