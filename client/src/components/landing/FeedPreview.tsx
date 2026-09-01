import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  Flame,
  Heart,
  MessageCircle,
  Play,
  Share2,
  Sparkles,
  Terminal,
} from "lucide-react";
import { SyntaxCode } from "@/components/code/SyntaxCode";
import { Badge } from "@/components/ui/badge";
import { cn, formatCount } from "@/lib/utils";

const SNIPPET = `// Debounce that actually cleans up after itself
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`;

const TABS = [
  { id: "code", label: "Code post", icon: Terminal },
  { id: "ai", label: "AI analysis", icon: Sparkles },
  { id: "streak", label: "Build streak", icon: Flame },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** 12 weeks of plausible activity for the heatmap preview. */
const HEATMAP: number[] = [
  0, 1, 2, 1, 3, 0, 0, 2, 3, 4, 2, 1, 0, 1, 3, 4, 4, 2, 3, 1, 0, 2, 2, 3, 4, 3,
  1, 0, 1, 4, 3, 2, 4, 2, 1, 0, 2, 3, 3, 4, 4, 1, 0, 3, 4, 2, 3, 4, 2, 1, 2, 4,
  3, 4, 3, 2, 1, 3, 4, 4, 2, 3, 1, 2, 4, 3, 4, 4, 3, 2, 1, 3, 4, 4, 3, 2, 3, 4,
  4, 2, 1, 3, 4, 4,
];

const LEVEL_CLASS = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

const STREAK_LOG = [
  { day: "Day 12", what: "Shipped the AI code-review panel" },
  { day: "Day 11", what: "Rate limiting + input validation on the API" },
  { day: "Day 10", what: "Judge0 sandbox for running snippets" },
];

/**
 * Interactive preview of the product shown on the landing page.
 * Self-contained: no API calls, no auth — it's a shop window.
 */
export function FeedPreview() {
  const [tab, setTab] = useState<TabId>("code");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Tab switcher */}
      <div className="mb-4 flex gap-1.5 rounded-full border border-border bg-card/60 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
              tab === t.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === t.id && (
              <motion.span
                layoutId="preview-tab"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-violet-500"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <t.icon className="relative h-3.5 w-3.5" />
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
        {/* Post header — constant across tabs so it reads as one post */}
        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/glass/svg?seed=priya_codes"
            alt=""
            className="h-10 w-10 rounded-full ring-1 ring-border"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              Priya Menon
              <span className="text-xs font-normal text-muted-foreground">
                @priya_codes
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              4h ago · <span className="text-primary">Code</span>
            </p>
          </div>
          <Badge variant="muted" className="ml-auto hidden sm:inline-flex">
            TypeScript
          </Badge>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mt-4"
          >
            {tab === "code" && (
              <>
                <p className="text-sm leading-relaxed">
                  Every debounce hook I find online leaks a timer on unmount.
                  Here's the version I actually ship 👇
                </p>
                <p className="mt-1.5 text-sm text-primary">
                  #typescript #react #hooks
                </p>

                <div className="mt-3">
                  <SyntaxCode
                    code={SNIPPET}
                    language="typescript"
                    title="useDebouncedValue.ts"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                    <Play className="h-3.5 w-3.5" /> Run code
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Ask AI
                  </span>
                </div>
              </>
            )}

            {tab === "ai" && (
              <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> AI analysis
                </p>
                <dl className="mt-3.5 space-y-3.5 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Time complexity
                    </dt>
                    <dd className="mt-0.5">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        O(1)
                      </code>{" "}
                      per update — the timer is replaced, not queued.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      What it does well
                    </dt>
                    <dd className="mt-0.5 text-muted-foreground">
                      The cleanup function clears the pending timeout, so rapid
                      input changes can't stack callbacks or update after unmount.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Suggested improvement
                    </dt>
                    <dd className="mt-0.5 text-muted-foreground">
                      Expose a <code className="font-mono text-xs">flush()</code>{" "}
                      helper so callers can commit the pending value immediately
                      on form submit.
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {tab === "streak" && (
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Flame className="h-4 w-4 text-orange-400" />
                  12 day build streak
                  <span className="text-xs font-normal text-muted-foreground">
                    · longest 28
                  </span>
                </p>

                <div className="mt-3.5 flex gap-[3px] overflow-hidden">
                  {Array.from({ length: 12 }).map((_, week) => (
                    <div key={week} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((__, day) => {
                        const level = HEATMAP[week * 7 + day] ?? 0;
                        return (
                          <span
                            key={day}
                            className={cn(
                              "h-3 w-3 rounded-[3px]",
                              LEVEL_CLASS[level]
                            )}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                <ul className="mt-4 space-y-2">
                  {STREAK_LOG.map((entry) => (
                    <li
                      key={entry.day}
                      className="flex gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm"
                    >
                      <span className="w-14 shrink-0 text-xs font-semibold text-primary">
                        {entry.day}
                      </span>
                      <span className="text-muted-foreground">{entry.what}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Engagement bar */}
        <div className="mt-4 flex items-center gap-1 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            aria-pressed={liked}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              liked
                ? "text-rose-500"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {formatCount(liked ? 325 : 324)}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            42
          </button>
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              saved
                ? "text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        A live preview — switch tabs and tap the buttons.
      </p>
    </div>
  );
}
