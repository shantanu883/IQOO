import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder shaped like a PostCard. */
export function PostSkeleton() {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <Skeleton className="mt-4 h-44 w-full rounded-xl" />
      <div className="mt-4 flex gap-3 border-t border-border/60 pt-3">
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </article>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
