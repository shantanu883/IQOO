import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import { CommentList } from "@/components/feed/CommentList";
import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { api } from "@/lib/api";
import type { Post } from "@/types";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPost(id);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <ErrorState
          title="Post not found"
          description={error || "This post doesn't exist"}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Post */}
      <PostCard post={post} />

      {/* Comments */}
      <div className="border-t border-border">
        <CommentList postId={post._id} />
      </div>
    </div>
  );
}
