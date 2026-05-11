import dynamic from "next/dynamic";
import { Suspense } from "react";

function ExploreFallback() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-14 text-white">
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

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExploreClient />
    </Suspense>
  );
}
