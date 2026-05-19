/**
 * Trang chủ — điểm vào chính của ứng dụng du lịch VN Insight.
 *
 * Chức năng:
 * - SiteSearchBar: tìm tỉnh/điểm đến hoặc bài viết.
 * - ProvinceShowcase: carousel 34 tỉnh/thành (client-only, dynamic import).
 * - Guide, Features: cẩm nang và điểm nhấn sản phẩm.
 * - Nền cố định ảnh + lớp gradient.
 */
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import Features from "@/components/Features";
import Guide from "@/components/Guide";
import SiteSearchBar from "@/components/SiteSearchBar";

const ProvinceShowcase = dynamic(() => import("@/components/ProvinceShowcase"), {
  ssr: false,
  loading: () => (
    <section className="py-12 text-white sm:py-16 lg:py-20" aria-busy="true">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-2xl backdrop-blur-sm lg:rounded-3xl">
          <div className="relative h-[min(74vh,560px)] bg-white/[0.06] sm:h-[580px] lg:h-[620px]" />
        </div>
      </div>
    </section>
  ),
});

export default function HomePage() {
  return (
    <div className="relative">
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <SiteSearchBar />
      </div>

      <Hero />

      <div className="text-white">
        <ProvinceShowcase />
        <Guide />
        <Features />
      </div>
    </div>
  );
}
