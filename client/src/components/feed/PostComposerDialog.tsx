import { useState } from "react";
import { Code2, HelpCircle, BookOpen, Trophy, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Post, PostType, CodeLanguage } from "@/types";
import { initials, cn } from "@/lib/utils";

const TYPES: { value: PostType; label: string; icon: typeof Code2 }[] = [
  { value: "post", label: "Update", icon: FileText },
  { value: "code", label: "Code", icon: Code2 },
  { value: "question", label: "Question", icon: HelpCircle },
  { value: "tutorial", label: "Tutorial", icon: BookOpen },
  { value: "achievement", label: "Win", icon: Trophy },
];

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX / React" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (post: Post) => void;
}

export function PostComposerDialog({ open, onOpenChange, onCreated }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [type, setType] = useState<PostType>("post");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [codeTitle, setCodeTitle] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>("typescript");
  const [code, setCode] = useState("");
  const [achievementTitle, setAchievementTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showCode = type === "code" || type === "tutorial";
  const showAchievement = type === "achievement";

  const reset = () => {
    setType("post");
    setCaption("");
    setTags("");
    setCodeTitle("");
    setCode("");
    setAchievementTitle("");
    setLanguage("typescript");
  };

  const close = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const canSubmit =
    caption.trim().length > 0 &&
    (!showCode || code.trim().length > 0) &&
    (!showAchievement || achievementTitle.trim().length > 0);

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const parsedTags = tags
        .split(/[,\s]+/)
        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean)
        .slice(0, 8);

      const post = await api.createPost({
        type,
        caption: caption.trim(),
        tags: parsedTags,
        code: showCode
          ? {
              title: codeTitle.trim() || undefined,
              language,
              code,
            }
          : undefined,
      });

      // Attach the achievement locally (composer supports simple wins).
      if (showAchievement) {
        post.achievement = { title: achievementTitle.trim(), icon: "trophy" };
      }

      toast({
        variant: "success",
        title: "Posted!",
        description: "Your post is live on the feed.",
      });
      onCreated(post);
      reset();
      onOpenChange(false);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Couldn't post",
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>
            Share what you're building — code, a question, or a win.
          </DialogDescription>
        </DialogHeader>

        {/* type selector */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                type === t.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {user && (
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
            </Avatar>
          )}
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={
              type === "question"
                ? "What's your question? Be specific…"
                : "What are you building?"
            }
            rows={3}
            className="flex-1 resize-none border-0 bg-transparent px-0 text-base focus-visible:ring-0"
            autoFocus
          />
        </div>

        {showAchievement && (
          <Input
            value={achievementTitle}
            onChange={(e) => setAchievementTitle(e.target.value)}
            placeholder="Achievement title (e.g. 1k stars on my repo)"
          />
        )}

        {showCode && (
          <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={codeTitle}
                onChange={(e) => setCodeTitle(e.target.value)}
                placeholder="filename.ts (optional)"
                className="flex-1 bg-background font-mono text-sm"
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here…"
              rows={8}
              className="resize-y bg-background font-mono text-[13px] leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags: react, typescript, webdev"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {caption.length}/500
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={submit}
              disabled={!canSubmit || submitting}
              className="gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
