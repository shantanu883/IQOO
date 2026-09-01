import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const icons = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertCircle,
} as const;

const iconColors = {
  default: "text-primary",
  success: "text-success",
  destructive: "text-destructive",
} as const;

/** Renders the live toast queue. Mount once near the app root. */
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const key = (variant ?? "default") as keyof typeof icons;
        const Icon = icons[key];
        return (
          <Toast key={id} variant={variant} {...props}>
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColors[key]}`} />
            <div className="flex flex-1 flex-col gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
