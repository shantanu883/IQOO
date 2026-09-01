import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, Flame, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const highlights = [
  {
    icon: Code2,
    title: "Share runnable code",
    body: "Post snippets with syntax highlighting, then run them inline.",
  },
  {
    icon: Sparkles,
    title: "AI code analysis",
    body: "Explain, debug, optimise and document any snippet on the feed.",
  },
  {
    icon: Flame,
    title: "Build streaks",
    body: "Log what you ship daily and grow a public contribution history.",
  },
  {
    icon: Users,
    title: "Find collaborators",
    body: "Match with developers by stack, interests and hackathon plans.",
  },
];

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Small print rendered under the card (e.g. "Already have an account?"). */
  footer?: ReactNode;
}

/** Two-pane shell shared by login / register / forgot-password. */
export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand pane — hidden on small screens where it would push the form down. */}
      <aside className="relative hidden overflow-hidden border-r border-border/60 bg-muted/30 p-12 lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-3xl"
        />

        <Link to="/" className="relative w-fit">
          <Logo size="lg" />
        </Link>

        <div className="relative mt-auto max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Where developers{" "}
            <span className="gradient-text">build in public.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Instagram shows what people are doing. DevLoop shows what developers
            are building.
          </p>

          <ul className="mt-10 space-y-5">
            {highlights.map((h, i) => (
              <motion.li
                key={h.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                className="flex gap-3.5"
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/70 text-primary">
                  <h.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{h.title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {h.body}
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form pane */}
      <main className="flex flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="mb-8 inline-block lg:hidden">
            <Logo size="md" />
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
