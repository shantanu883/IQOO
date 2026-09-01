import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Disables unselected chips once this many are picked. */
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Reusable pill-style multi-select used for technologies, interests and tags. */
export function ChipSelect({
  options,
  selected,
  onToggle,
  max,
  size = "md",
  className,
}: Props) {
  const atLimit = max !== undefined && selected.length >= max;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const disabled = !isSelected && atLimit;

        return (
          <button
            key={option}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onToggle(option)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all",
              size === "sm"
                ? "px-3 py-1.5 text-xs"
                : "px-3.5 py-2 text-sm",
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-soft"
                : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground",
              disabled && "cursor-not-allowed opacity-40 hover:border-border hover:bg-transparent"
            )}
          >
            {isSelected && <Check className="h-3.5 w-3.5" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}
