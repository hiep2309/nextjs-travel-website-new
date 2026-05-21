/**
 * Trang Khám phá / Blog — liệt kê bài viết Firestore đã duyệt.
 */
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { initPageLocale } from "@/lib/i18n/server";
import { generatePageMetadata, PAGE_META } from "@/lib/i18n/pageMetadata";

function ExploreFallback() {
  return (
    <div className="min-h-screen pt-24 pb-14 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-white/70">Đang tải…</p>
      </div>
    </div>
  );
}

const ExploreClient = dynamic(() => import("./ExploreClient"), {
  ssr: false,
  loading: () => <ExploreFallback />,
});

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generatePageMetadata(params.locale, PAGE_META.explore);
}

export default function ExplorePage({ params }: Props) {
  initPageLocale(params.locale);

  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExploreClient />
    </Suspense>
  );
}
