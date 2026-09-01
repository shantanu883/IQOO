import { useCallback, useState } from "react";
import { Loader2, PenSquare } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeletonList } from "@/components/feed/PostSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { useAppOutlet } from "@/components/layout/AppLayout";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { FeedParams } from "@/lib/api";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";

type Filter = NonNullable<FeedParams["filter"]>;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "For you" },
  { value: "following", label: "Following" },
  { value: "code", label: "Code" },
  { value: "project", label: "Projects" },
  { value: "question", label: "Questions" },
  { value: "tutorial", label: "Tutorials" },
];

export default function Home() {
  const { user } = useAuth();
  const { feedVersion, openComposer } = useAppOutlet();
  const [filter, setFilter] = useState<Filter>("all");

  const fetchPage = useCallback(
    (page: number) => api.getFeed({ page, limit: 5, filter }),
    [filter]
  );

  const {
    items: posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reload,
    setItems,
  } = usePaginatedList<Post>({
    fetchPage,
    // feedVersion bumps when the composer creates a post.
    deps: [filter, feedVersion],
  });

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

  const firstName = user?.fullName?.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[600px]">
      {/* Composer entry point */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-4">
        <button
          type="button"
          onClick={openComposer}
          className="flex w-full items-center gap-3 text-left"
        >
          <img
            src={user?.avatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full ring-1 ring-border"
          />
          <span className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted">
            {firstName
              ? `What are you building today, ${firstName}?`
              : "What are you building today?"}
          </span>
          <span className="hidden sm:block">
            <Button variant="gradient" size="sm" className="gap-1.5" asChild>
              <span>
                <PenSquare className="h-4 w-4" />
                Post
              </span>
            </Button>
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 -mx-4 mb-4 overflow-x-auto border-b border-border/60 bg-background/90 px-4 pb-2 backdrop-blur-lg md:-mx-6 md:px-6">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading && <PostSkeletonList count={3} />}

      {!loading && error && (
        <ErrorState
          title="Couldn't load your feed"
          description={error}
          onRetry={reload}
        />
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          icon={PenSquare}
          title={
            filter === "following"
              ? "Nothing from the people you follow yet"
              : "No posts here yet"
          }
          description={
            filter === "following"
              ? "Follow a few more developers, or switch to “For you” to see what everyone's building."
              : "Be the first to share what you're working on."
          }
          action={
            <Button variant="gradient" onClick={openComposer} className="gap-2">
              <PenSquare className="h-4 w-4" />
              Create a post
            </Button>
          }
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(id) =>
                  setItems((prev) => prev.filter((p) => p._id !== id))
                }
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-px" aria-hidden />

          {loadingMore && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!hasMore && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              You're all caught up. 🎉
            </p>
          )}
        </>
      )}
    </div>
  );
}
