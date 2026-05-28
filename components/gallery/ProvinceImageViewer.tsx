"use client";

import ImageLightboxViewer, { type ImageLightboxLabels } from "@/components/gallery/ImageLightboxViewer";
import type { ProvincePostImage } from "@/lib/posts/postsByProvince";

type Props = {
  images: ProvincePostImage[];
  initialIndex?: number;
  onClose: () => void;
  labels: ImageLightboxLabels;
};

export default function ProvinceImageViewer({ images, initialIndex = 0, onClose, labels }: Props) {
  const urls = images.map((img) => img.url);
  return <ImageLightboxViewer images={urls} initialIndex={initialIndex} onClose={onClose} labels={labels} />;
}
