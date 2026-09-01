import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Bookmark,
  Code2,
  Eye,
  FolderGit2,
  GraduationCap,
  Heart,
  HelpCircle,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Star,
  Trash2,
  Trophy,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CodeBlock } from "@/components/code/CodeBlock";
import { CommentList } from "./CommentList";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Post, PostType } from "@/types";
import { cn, formatCount, initials, timeAgo } from "@/lib/utils";

const TYPE_META: Record<
  PostType,
  { label: string; icon: typeof Code2; className: string }
> = {
  code: { label: "Code", icon: Code2, className: "text-primary" },
  project: { label: "Project", icon: FolderGit2, className: "text-sky-400" },
  question: { label: "Question", icon: HelpCircle, className: "text-amber-400" },
  tutorial: {
    label: "Tutorial",
    icon: GraduationCap,
    className: "text-emerald-400",
  },
  achievement: { label: "Win", icon: Trophy, className: "text-orange-400" },
  post: { label: "Update", icon: Code2, className: "text-muted-foreground" },
};

interface Props {
  post: Post;
  /** Comments open by default (used on the post detail page). */
  defaultCommentsOpen?: boolean;
  onDeleted?: (id: string) => void;
}

export function PostCard({ post, defaultCommentsOpen = false, onDeleted }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [liked, setLiked] = useState(!!post.liked);
  const [likes, setLikes] = useState(post.likesCount);
  const [bookmarked, setBookmarked] = useState(!!post.bookmarked);
  const [comments, setComments] = useState(post.commentsCount);
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen);
  const [deleted, setDeleted] = useState(false);

  const meta = TYPE_META[post.type];
  const isOwn = user?._id === post.author._id;
  const postUrl = `${window.location.origin}/post/${post._id}`;

  if (deleted) return null;

  /** Optimistic like — reverted if the request fails. */
  const toggleLike = async () => {
    const prev = { liked, likes };
    setLiked(!liked);
    setLikes(likes + (liked ? -1 : 1));
    try {
      const res = await api.toggleLike(post._id);
      setLiked(res.liked);
      setLikes(res.likesCount);
    } catch {
      setLiked(prev.liked);
      setLikes(prev.likes);
      toast({ variant: "destructive", title: "Couldn't update your like" });
    }
  };

  const toggleBookmark = async () => {
    const prev = bookmarked;
    setBookmarked(!bookmarked);
    try {
      const res = await api.toggleBookmark(post._id);
      setBookmarked(res.bookmarked);
      toast({
        title: res.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks",
      });
    } catch {
      setBookmarked(prev);
      toast({ variant: "destructive", title: "Couldn't update your bookmark" });
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.author.fullName} on DevLoop`,
          text: post.caption,
          url: postUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(postUrl);
      toast({ title: "Link copied to clipboard" });
    } catch {
      // User dismissed the share sheet, or the clipboard was unavailable.
    }
  };

  const remove = async () => {
    try {
      await api.deletePost(post._id);
      setDeleted(true);
      onDeleted?.(post._id);
      toast({ title: "Post deleted" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Couldn't delete the post",
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-border/80 sm:p-5">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link to={`/u/${post.author.username}`} className="shrink-0">
          <Avatar className="h-10 w-10 ring-1 ring-border">
            <AvatarImage src={post.author.avatar} alt={post.author.fullName} />
            <AvatarFallback>{initials(post.author.fullName)}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm">
            <Link
              to={`/u/${post.author.username}`}
              className="font-semibold hover:underline"
            >
              {post.author.fullName}
            </Link>
            {post.author.isVerified && (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-primary"
                aria-label="Verified developer"
              />
            )}
            <span className="truncate text-xs text-muted-foreground">
              @{post.author.username}
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to={`/post/${post._id}`} className="hover:underline">
              {timeAgo(post.createdAt)}
            </Link>
            <span aria-hidden>·</span>
            <span className={cn("inline-flex items-center gap-1", meta.className)}>
              <meta.icon className="h-3 w-3" />
              {meta.label}
            </span>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Post options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={share}>
              <Link2 /> Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleBookmark}>
              <Bookmark /> {bookmarked ? "Remove bookmark" : "Save post"}
            </DropdownMenuItem>
            {isOwn && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={remove}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 /> Delete post
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Caption */}
      <div className="mt-3">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {post.caption}
        </p>
        {post.tags.length > 0 && (
          <p className="mt-1.5 flex flex-wrap gap-x-2 text-sm">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?tag=${encodeURIComponent(tag)}`}
                className="text-primary hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </p>
        )}
      </div>

      {/* Achievement banner */}
      {post.achievement && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-orange-500/25 bg-orange-500/[0.06] p-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-500/15 text-orange-400">
            <Trophy className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
              Achievement unlocked
            </p>
            <p className="truncate text-sm font-medium">
              {post.achievement.title}
            </p>
          </div>
        </div>
      )}

      {/* Code */}
      {post.code && (
        <div className="mt-3">
          <CodeBlock content={post.code} />
        </div>
      )}

      {/* Embedded project */}
      {post.project && (
        <Link
          to={`/projects/${post.project._id}`}
          className="mt-3 block overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/40"
        >
          {post.project.coverImage && (
            <img
              src={post.project.coverImage}
              alt=""
              loading="lazy"
              className="aspect-[16/8] w-full object-cover"
            />
          )}
          <div className="p-3.5">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <FolderGit2 className="h-4 w-4 text-sky-400" />
              {post.project.name}
            </p>
            {post.project.tagline && (
              <p className="mt-1 text-sm text-muted-foreground">
                {post.project.tagline}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {post.project.techStack.slice(0, 5).map((t) => (
                <Badge key={t} variant="muted">
                  {t}
                </Badge>
              ))}
              <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5" />
                {formatCount(post.project.starsCount)}
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Images */}
      {post.media?.images && post.media.images.length > 0 && (
        <div
          className={cn(
            "mt-3 grid gap-2 overflow-hidden rounded-xl",
            post.media.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {post.media.images.slice(0, 4).map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="aspect-video w-full rounded-lg border border-border object-cover"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <footer className="mt-3.5 flex items-center gap-0.5 border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
            liked
              ? "text-rose-500"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          {formatCount(likes)}
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          aria-expanded={commentsOpen}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
            commentsOpen
              ? "text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          {formatCount(comments)}
        </button>

        <button
          type="button"
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
            bookmarked
              ? "text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
          <span className="hidden sm:inline">
            {bookmarked ? "Saved" : "Save"}
          </span>
        </button>

        <button
          type="button"
          onClick={share}
          aria-label="Share post"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {formatCount(post.viewsCount)}
        </span>
      </footer>

      {commentsOpen && (
        <CommentList postId={post._id} onCountChange={setComments} />
      )}
    </article>
  );
}
