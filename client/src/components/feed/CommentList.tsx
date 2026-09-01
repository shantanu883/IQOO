import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Comment } from "@/types";
import { initials, timeAgo } from "@/lib/utils";

interface Props {
  postId: string;
  /** Bubbles the new total up so the card's counter stays in sync. */
  onCountChange?: (count: number) => void;
}

export function CommentList({ postId, onCountChange }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    setComments(null);
    setError(false);
    api
      .getComments(postId)
      .then((list) => active && setComments(list))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [postId]);

  /** Accepts form submits and the Enter shortcut alike. */
  const submit = async (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || posting) return;

    setPosting(true);
    try {
      const created = await api.addComment(postId, body);
      setComments((prev) => {
        const next = [...(prev ?? []), created];
        onCountChange?.(next.length);
        return next;
      });
      setText("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't post your comment",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      {user && (
        <form onSubmit={submit} className="flex gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback className="text-xs">
              {initials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={1}
              placeholder="Add a comment…"
              className="min-h-9 resize-none py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(e);
                }
              }}
            />
            {text.trim() && (
              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="gradient"
                  disabled={posting}
                  className="gap-1.5"
                >
                  {posting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-3.5 w-3.5" />
                  )}
                  Comment
                </Button>
              </div>
            )}
          </div>
        </form>
      )}

      {comments === null && !error && (
        <div className="mt-4 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-muted-foreground">
          Couldn't load comments.
        </p>
      )}

      {comments && comments.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          No comments yet — be the first to reply.
        </p>
      )}

      {comments && comments.length > 0 && (
        <ul className="mt-4 space-y-3.5">
          {comments.map((c) => (
            <li key={c._id} className="flex gap-2.5">
              <Link to={`/u/${c.author.username}`} className="shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.author.avatar} alt={c.author.fullName} />
                  <AvatarFallback className="text-xs">
                    {initials(c.author.fullName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0">
                <p className="text-sm">
                  <Link
                    to={`/u/${c.author.username}`}
                    className="font-semibold hover:underline"
                  >
                    {c.author.fullName}
                  </Link>{" "}
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(c.createdAt)}
                  </span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
                  {c.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
