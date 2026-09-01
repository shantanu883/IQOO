import { useState } from "react";
import { AlertCircle, Clock, Cpu, Loader2, Play, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { CodeLanguage, RunResult } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  language: CodeLanguage;
  onClose: () => void;
}

/**
 * Code execution panel.
 *
 * Delegates to `api.runCode`, which hits the server's Judge0 abstraction.
 * When no Judge0 key is configured the server returns `mock: true` and a
 * simulated result — surfaced explicitly below so nothing looks like a
 * real sandbox run when it isn't.
 */
export function RunPanel({ code, language, onClose }: Props) {
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await api.runCode({ code, language, stdin: stdin || undefined });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Execution failed.");
    } finally {
      setRunning(false);
    }
  };

  const failed =
    result && (result.stderr.trim().length > 0 || /error/i.test(result.status));

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Run code</p>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-muted-foreground">
          Input (stdin)
        </label>
        <Textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          rows={2}
          placeholder="Optional — one value per line"
          className="mt-1.5 resize-y bg-background font-mono text-xs"
          spellCheck={false}
        />
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={run}
        disabled={running}
        className="mt-3 gap-1.5"
      >
        {running ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
        {running ? "Running…" : "Run"}
      </Button>

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {result && (
        <div className="mt-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-semibold",
                failed
                  ? "bg-destructive/15 text-destructive"
                  : "bg-success/15 text-success"
              )}
            >
              {result.status}
            </span>
            {result.time && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {result.time}s
              </span>
            )}
            {result.memory && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Cpu className="h-3 w-3" /> {result.memory} KB
              </span>
            )}
            {result.mock && (
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 font-medium text-amber-500">
                Simulated — no Judge0 key configured
              </span>
            )}
          </div>

          {result.stdout.trim() && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Output</p>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-[#12121c] p-3 font-mono text-xs leading-relaxed text-[#e6e6f0]">
                {result.stdout}
              </pre>
            </div>
          )}

          {result.stderr.trim() && (
            <div>
              <p className="text-xs font-medium text-destructive">Errors</p>
              <pre className="mt-1 overflow-x-auto rounded-lg border border-destructive/25 bg-destructive/5 p-3 font-mono text-xs leading-relaxed text-destructive">
                {result.stderr}
              </pre>
            </div>
          )}

          {!result.stdout.trim() && !result.stderr.trim() && (
            <p className="text-xs text-muted-foreground">
              Finished with no output.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
