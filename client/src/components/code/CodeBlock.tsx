import { useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { SyntaxCode } from "./SyntaxCode";
import { RunPanel } from "./RunPanel";
import { AiPanel } from "./AiPanel";
import { Button } from "@/components/ui/button";
import type { CodeContent } from "@/types";

interface Props {
  content: CodeContent;
  /** Hide the run/AI actions (e.g. in compact previews). */
  actions?: boolean;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

/** A code snippet plus its developer actions: copy, run, and AI analysis. */
export function CodeBlock({
  content,
  actions = true,
  showLineNumbers = true,
  maxHeight = "460px",
}: Props) {
  const [runOpen, setRunOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div>
      {content.description && (
        <p className="mb-2 text-sm text-muted-foreground">
          {content.description}
        </p>
      )}

      <SyntaxCode
        code={content.code}
        language={content.language}
        title={content.title}
        showLineNumbers={showLineNumbers}
        maxHeight={maxHeight}
      />

      {actions && (
        <>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRunOpen((v) => !v)}
              className="gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              Run code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiOpen(true)}
              className="gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI
            </Button>
          </div>

          {runOpen && (
            <RunPanel
              code={content.code}
              language={content.language}
              onClose={() => setRunOpen(false)}
            />
          )}

          <AiPanel
            open={aiOpen}
            onOpenChange={setAiOpen}
            code={content.code}
            language={content.language}
            title={content.title}
          />
        </>
      )}
    </div>
  );
}
