import { useState } from "react";
import {
  AlertCircle,
  Bug,
  FileText,
  Gauge,
  Lightbulb,
  Loader2,
  Sparkles,
  Wand2,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SyntaxCode } from "@/components/code/SyntaxCode";
import { api } from "@/lib/api";
import type { AiAction, AiAnalysis, CodeLanguage } from "@/types";
import { cn } from "@/lib/utils";

const ACTIONS: {
  action: AiAction;
  label: string;
  icon: typeof Bug;
  blurb: string;
}[] = [
  {
    action: "explain",
    label: "Explain code",
    icon: BookOpen,
    blurb: "Walk through what it does, step by step",
  },
  {
    action: "bugs",
    label: "Find bugs",
    icon: Bug,
    blurb: "Spot edge cases and likely failures",
  },
  {
    action: "optimize",
    label: "Optimize",
    icon: Gauge,
    blurb: "Reduce work and allocations",
  },
  {
    action: "improve",
    label: "Suggest improvements",
    icon: Lightbulb,
    blurb: "Readability, naming and structure",
  },
  {
    action: "complexity",
    label: "Calculate complexity",
    icon: Wand2,
    blurb: "Time and space analysis",
  },
  {
    action: "document",
    label: "Generate documentation",
    icon: FileText,
    blurb: "Doc comments for the public surface",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  language: CodeLanguage;
  /** Optional filename shown above the snippet. */
  title?: string;
}

/**
 * "Ask AI" panel for a code snippet.
 *
 * Calls `api.analyzeCode`, backed by the server's Gemini abstraction. If no
 * Gemini key is set, the server responds with `mock: true` and deterministic
 * static analysis — labelled in the UI so it is never mistaken for a model
 * response.
 */
export function AiPanel({ open, onOpenChange, code, language, title }: Props) {
  const [active, setActive] = useState<AiAction | null>(null);
  const [loading, setLoading] = useState<AiAction | null>(null);
  const [results, setResults] = useState<Partial<Record<AiAction, AiAnalysis>>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  const run = async (action: AiAction) => {
    setActive(action);
    setError(null);

    // Results are cached per action for the lifetime of the panel.
    if (results[action]) return;

    setLoading(action);
    try {
      const res = await api.analyzeCode({ action, code, language });
      setResults((prev) => ({ ...prev, [action]: res }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(null);
    }
  };

  const current = active ? results[active] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI code analysis
          </DialogTitle>
          <DialogDescription>
            Pick what you want to know about this snippet.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[calc(88vh-5.5rem)] overflow-y-auto md:grid-cols-[240px_1fr] md:overflow-hidden">
          {/* Action list */}
          <div className="border-b border-border p-3 md:border-b-0 md:border-r md:overflow-y-auto">
            <div className="grid gap-1.5 sm:grid-cols-2 md:grid-cols-1">
              {ACTIONS.map((a) => (
                <button
                  key={a.action}
                  type="button"
                  onClick={() => run(a.action)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                    active === a.action
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  )}
                >
                  {loading === a.action ? (
                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <a.icon className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">
                      {a.label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-xs leading-snug",
                        active === a.action
                          ? "text-primary/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {a.blurb}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="p-5 md:overflow-y-auto">
            {!active && (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium">
                  Choose an analysis to start
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  The snippet is sent to the server, which calls Gemini and
                  returns the result here.
                </p>
              </div>
            )}

            {error && (
              <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {active && loading === active && !current && (
              <div className="space-y-2.5">
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-11/12 rounded" />
                <div className="skeleton h-3 w-4/5 rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            )}

            {current && (
              <article>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{current.label}</h3>
                  {current.mock && (
                    <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                      Deterministic analysis — no Gemini key configured
                    </span>
                  )}
                </div>

                {/* Server returns plain text with blank-line paragraphs. */}
                <div className="mt-3 space-y-3 text-sm leading-relaxed">
                  {current.result
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="whitespace-pre-wrap">
                        {para}
                      </p>
                    ))}
                </div>
              </article>
            )}

            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Snippet under review
              </p>
              <SyntaxCode
                code={code}
                language={language}
                title={title}
                maxHeight="220px"
                copyable={false}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
