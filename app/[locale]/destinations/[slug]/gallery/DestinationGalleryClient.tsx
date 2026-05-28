"use client";

import { useMemo, useState } from "react";
import FlexibleImage from "@/components/ui/FlexibleImage";
import ProvinceImageViewer from "@/components/gallery/ProvinceImageViewer";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useDestinationPageModel } from "@/hooks/useDestinationPageModel";
import { useProvincePosts } from "@/hooks/useProvincePosts";
import { collectImagesFromPosts } from "@/lib/posts/postsByProvince";
import { provinceNameToSlug } from "@/lib/provinceSlug";
import type { ProvinceDef } from "@/lib/vietnamProvinces";

type Props = { province: ProvinceDef };

export default function DestinationGalleryClient({ province }: Props) {
  const t = useTranslations("Destinations");
  const data = useDestinationPageModel(province);
  const { posts, loading } = useProvincePosts(province.name);
  const images = useMemo(() => collectImagesFromPosts(posts), [posts]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const slug = provinceNameToSlug(province.name);

  const viewerLabels = {
    close: t("galleryClose"),
    zoomOut: t("galleryZoomOut"),
    zoomIn: t("galleryZoomIn"),
    fullscreen: t("galleryFullscreen"),
    exitFullscreen: t("galleryExitFullscreen"),
    download: t("galleryDownload"),
    counter: (current: number, total: number) => t("galleryCounter", { current, total }),
  };

  return (
    <div className="min-h-screen pb-20 pt-20 text-slate-100 sm:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">{data.localized.name}</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{t("gallery")}</h1>
            {!loading && images.length > 0 ? (
              <p className="mt-2 text-sm text-white/55">{t("galleryImageCount", { count: images.length })}</p>
            ) : null}
          </div>
          <Link
            href={`/destinations/${slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("backToDestination")}
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-16 text-center text-sm text-slate-400">
            {t("noProvinceGallery")}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map(({ url, postId }, index) => (
              <button
                key={`${postId}-${url}`}
                type="button"
                onClick={() => setViewerIndex(index)}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
              >
                <FlexibleImage
                  src={url}
                  alt=""
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {viewerIndex !== null && images.length > 0 ? (
        <ProvinceImageViewer
          images={images}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          labels={viewerLabels}
        />
      ) : null}
    </div>
  );
}
