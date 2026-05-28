"use client";

import { X } from "lucide-react";
import FlexibleImage from "@/components/ui/FlexibleImage";

export type PreviewImage = {
  id: string;
  url: string;
  source: "url" | "file";
  file?: File;
};

type ImagePreviewProps = {
  images: PreviewImage[];
  onRemove: (id: string) => void;
};

export default function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {images.map((img) => (
        <div
          key={img.id}
          className="group relative size-20 overflow-hidden rounded-xl border border-white/15 bg-slate-800/80 transition hover:border-amber-400/40"
        >
          <FlexibleImage
            src={img.url}
            alt=""
            sizes="80px"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={() => onRemove(img.id)}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
            aria-label="Remove"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
