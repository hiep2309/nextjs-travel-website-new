import Hero from "@/components/sections/Hero";
import ProvinceShowcase from "@/components/ProvinceShowcase";
import Features from "@/components/Features";
import Guide from "@/components/Guide";

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
