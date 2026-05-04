import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

function ExploreFallback() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-14 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-white/70">Đang tải…</p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExploreClient />
    </Suspense>
  );
}
