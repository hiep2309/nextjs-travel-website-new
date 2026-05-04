import React from "react";
import ImageSlider from "./ImageSlider";

const Features = () => {
  return (
    <section className="relative overflow-hidden py-16 text-white sm:py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_45%)]" />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6 md:p-8 lg:rounded-3xl lg:p-10">
          <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="w-full overflow-hidden rounded-2xl border border-white/15">
              <ImageSlider />
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/70">Why choose us</p>
              <h2 className="mb-6 text-2xl font-semibold leading-tight sm:mb-8 sm:text-3xl lg:text-5xl">
                Explore Vietnam with confidence
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold sm:text-lg">Explore Vietnam</h3>
                  <p className="text-sm leading-relaxed text-white/75">
                    Discover breathtaking landscapes and vibrant cities across Vietnam.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold sm:text-lg">Popular Destinations</h3>
                  <p className="text-sm leading-relaxed text-white/75">
                    Visit famous places like Ha Long Bay, Sapa, Hoi An and Phu Quoc.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold sm:text-lg">Travel Guide</h3>
                  <p className="text-sm leading-relaxed text-white/75">
                    Get tips about culture, food, transportation and travel planning.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold sm:text-lg">Featured Tours</h3>
                  <p className="text-sm leading-relaxed text-white/75">
                    Explore curated tours and unforgettable travel experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
