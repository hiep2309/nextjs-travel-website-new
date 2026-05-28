"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ImageLightboxViewer from "@/components/gallery/ImageLightboxViewer";

type CommentImageGridProps = {
  urls: string[];
};

/** Comment/reply image gallery — opens in-page lightbox instead of a new tab. */
export default function CommentImageGrid({ urls }: CommentImageGridProps) {
  const tDest = useTranslations("Destinations");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const list = useMemo(
    () => urls.filter((u) => typeof u === "string" && u.startsWith("http")),
    [urls],
  );

  const viewerLabels = useMemo(
    () => ({
      close: tDest("galleryClose"),
      zoomOut: tDest("galleryZoomOut"),
      zoomIn: tDest("galleryZoomIn"),
      fullscreen: tDest("galleryFullscreen"),
      exitFullscreen: tDest("galleryExitFullscreen"),
      download: tDest("galleryDownload"),
      counter: (current: number, total: number) => tDest("galleryCounter", { current, total }),
    }),
    [tDest],
  );

  if (list.length === 0) return null;

  const gridClass =
    list.length === 1
      ? "grid-cols-1 max-w-sm"
      : list.length === 2
        ? "grid-cols-2 max-w-md"
        : "grid-cols-2 sm:grid-cols-3 max-w-lg";

  return (
    <>
      <div className={`mt-2 grid gap-2 ${gridClass}`}>
        {list.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setViewerIndex(index)}
            className="group relative block aspect-square overflow-hidden rounded-xl border border-white/10 bg-slate-800/50 text-left transition hover:border-amber-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>

      {viewerIndex !== null ? (
        <ImageLightboxViewer
          images={list}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          labels={viewerLabels}
        />
      ) : null}
    </>
  );
}
