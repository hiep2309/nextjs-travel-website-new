"use client";

export function Skeleton({
  className = "",
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-white/10 ${rounded} ${className}`}
      aria-hidden
    />
  );
}

/** Lưới thẻ bài giống Explore (ảnh + 3 dòng chữ) */
export function ExplorePostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06]">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4 sm:p-5">
        <Skeleton className="h-4 w-[72%]" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[88%]" />
      </div>
    </div>
  );
}
