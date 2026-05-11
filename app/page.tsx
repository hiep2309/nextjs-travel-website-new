import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import Features from "@/components/Features";
import Guide from "@/components/Guide";

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
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/signup_pic.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/35 to-black/70" />

      <Hero />

      <main className="text-white">
        <ProvinceShowcase />
        <Guide />
        <Features />
      </main>
    </div>
  );
}
