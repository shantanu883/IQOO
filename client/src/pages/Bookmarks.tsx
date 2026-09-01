import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useAppOutlet } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import type { Post } from "@/types";

export default function Bookmarks() {
  const { feedVersion } = useAppOutlet();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.posts.getBookmarked();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [feedVersion]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bookmarks</h1>
              <p className="text-xs text-muted-foreground">
                Posts you've saved for later
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Posts */}
      <div className="divide-y divide-border">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : error ? (
          <div className="p-4 sm:p-6">
            <ErrorState
              title="Failed to load bookmarks"
              message={error}
              action={{ label: "Try again", onClick: fetchBookmarks }}
            />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              icon={Bookmark}
              title="No bookmarks yet"
              message="Posts you bookmark will appear here so you can easily find them later."
            />
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}
