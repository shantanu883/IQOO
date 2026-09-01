import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Validation message — also wires up aria-invalid / aria-describedby. */
  error?: string;
  hint?: string;
}

/** Labelled input with inline validation messaging. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
      ? `${inputId}-hint`
      : undefined;

    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "h-11",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Field.displayName = "Field";

/** Password field with a show/hide toggle. */
export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
      ? `${inputId}-hint`
      : undefined;

    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="relative">
          <Input
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              "h-11 pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
PasswordField.displayName = "PasswordField";
