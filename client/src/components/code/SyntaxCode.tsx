/* ─────────────────────────────────────────────────────────────
 * DevLoop — syntax highlighting surface
 * Pure presentation: highlight + copy. `CodeBlock` layers the
 * post-level actions (run, AI analysis) on top of this.
 * ───────────────────────────────────────────────────────────── */
import { useState, type CSSProperties } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Check, Copy } from "lucide-react";
import type { CodeLanguage } from "@/types";
import { cn } from "@/lib/utils";

/** Our CodeLanguage union mapped onto Prism's grammar names. */
const PRISM_LANG: Record<CodeLanguage, string> = {
  java: "java",
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  c: "c",
  cpp: "cpp",
  html: "markup",
  css: "css",
  jsx: "jsx",
  sql: "sql",
};

/** Human-readable labels for the language chip. */
export const LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  c: "C",
  cpp: "C++",
  html: "HTML",
  css: "CSS",
  jsx: "JSX",
  sql: "SQL",
};

/**
 * Custom Prism theme.
 *
 * Code keeps a dark "editor" surface in both light and dark app themes —
 * a deliberate choice so snippets read identically everywhere and the
 * palette stays on-brand rather than borrowing another product's look.
 */
const theme: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: "#e6e6f0",
    background: "none",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: "13px",
    lineHeight: 1.65,
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    tabSize: 2,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#e6e6f0",
    background: "transparent",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: "13px",
    lineHeight: 1.65,
    margin: 0,
    padding: "16px",
    overflow: "auto",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    tabSize: 2,
    hyphens: "none",
  },
  comment: { color: "#6b6b85", fontStyle: "italic" },
  prolog: { color: "#6b6b85" },
  doctype: { color: "#6b6b85" },
  cdata: { color: "#6b6b85" },
  punctuation: { color: "#a9a9c2" },
  property: { color: "#7dd3fc" },
  tag: { color: "#f472b6" },
  boolean: { color: "#fbbf24" },
  number: { color: "#fbbf24" },
  constant: { color: "#fbbf24" },
  symbol: { color: "#fbbf24" },
  deleted: { color: "#fb7185" },
  selector: { color: "#a3e635" },
  "attr-name": { color: "#c4b5fd" },
  string: { color: "#a3e635" },
  char: { color: "#a3e635" },
  builtin: { color: "#7dd3fc" },
  inserted: { color: "#a3e635" },
  operator: { color: "#a9a9c2" },
  entity: { color: "#7dd3fc", cursor: "help" },
  url: { color: "#7dd3fc" },
  variable: { color: "#e6e6f0" },
  atrule: { color: "#c4b5fd" },
  "attr-value": { color: "#a3e635" },
  function: { color: "#8b7cf8" },
  "class-name": { color: "#7dd3fc" },
  keyword: { color: "#c084fc", fontWeight: "500" },
  regex: { color: "#fbbf24" },
  important: { color: "#fb7185", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

interface Props {
  code: string;
  language: CodeLanguage;
  /** Optional filename/title shown in the header bar. */
  title?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  /** Caps the scroll height, e.g. "420px". */
  maxHeight?: string;
  className?: string;
}

export function SyntaxCode({
  code,
  language,
  title,
  showLineNumbers = false,
  copyable = true,
  maxHeight,
  className,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is unavailable over plain HTTP or without permission —
      // fail quietly rather than throwing at the user.
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-[#12121c]",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        {title && (
          <span className="ml-1 truncate font-mono text-xs text-white/60">
            {title}
          </span>
        )}
        <span className="ml-auto rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
          {LANGUAGE_LABEL[language]}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy code"}
            className="rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-lime-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      <div style={maxHeight ? { maxHeight, overflow: "auto" } : undefined}>
        <SyntaxHighlighter
          language={PRISM_LANG[language]}
          style={theme}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#4b4b63",
            userSelect: "none",
          }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
