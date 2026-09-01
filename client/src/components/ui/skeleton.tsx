import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Shimmering placeholder block for loading states. */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}

export { Skeleton };
