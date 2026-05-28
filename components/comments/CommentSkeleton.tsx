import { Skeleton } from "@/components/ui/Skeleton";

export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[85%]" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
