import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Show the wordmark next to the mark. */
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { box: "h-7 w-7 rounded-lg text-[13px]", text: "text-base" },
  md: { box: "h-9 w-9 rounded-xl text-base", text: "text-lg" },
  lg: { box: "h-11 w-11 rounded-2xl text-xl", text: "text-2xl" },
};

/** DevLoop brand mark: a violet tile with code brackets + a lime "loop" dot. */
export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid place-items-center font-mono font-bold text-white shadow-glow",
          "bg-gradient-to-br from-primary to-violet-500",
          s.box
        )}
        aria-hidden
      >
        {"<>"}
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lime-400 ring-2 ring-background" />
      </span>
      {showText && (
        <span className={cn("font-bold tracking-tight", s.text)}>
          Dev<span className="gradient-text">Loop</span>
        </span>
      )}
    </span>
  );
}
