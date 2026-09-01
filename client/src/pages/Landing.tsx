import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Flame,
  FolderGit2,
  Moon,
  Sparkles,
  Sun,
  Trophy,
  UserRoundSearch,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { FeedPreview } from "@/components/landing/FeedPreview";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { DEMO_MODE } from "@/lib/api";

const FEATURES = [
  {
    icon: Code2,
    title: "Code sharing",
    body: "Post snippets in ten languages with real syntax highlighting, one-tap copy, and an inline runner for stdin/stdout.",
  },
  {
    icon: FolderGit2,
    title: "Project showcase",
    body: "Publish projects with screenshots, tech stack, live demo and repo links — a portfolio that stays current.",
  },
  {
    icon: Sparkles,
    title: "AI code review",
    body: "Ask for an explanation, bug hunt, optimisation, complexity analysis or generated docs on any snippet in the feed.",
  },
  {
    icon: Flame,
    title: "Build streaks",
    body: "Log what you shipped each day and grow a contribution heatmap that proves consistency, not just intent.",
  },
  {
    icon: Trophy,
    title: "Hackathon teams",
    body: "Browse upcoming hackathons, post the roles you need, and fill your team before registration closes.",
  },
  {
    icon: UserRoundSearch,
    title: "Developer matching",
    body: "Transparent scoring on shared stack, interests and experience — with the reason behind every match spelled out.",
  },
];

const STATS = [
  { value: "10", label: "languages supported" },
  { value: "6", label: "AI analysis actions" },
  { value: "32", label: "features on the roadmap" },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Link to="/">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {isAuthenticated ? (
              <Button variant="gradient" size="sm" asChild>
                <Link to="/">Open feed</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button variant="gradient" size="sm" asChild>
                  <Link to="/register">Join DevLoop</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:56px_56px]"
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {DEMO_MODE && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Demo mode — explore with sample data, no signup needed
              </span>
            )}

            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Where developers{" "}
              <span className="gradient-text">build in public.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Share code. Showcase projects. Find collaborators. Build your
              developer identity.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="gradient" size="lg" asChild>
                <Link to="/register">
                  Join DevLoop <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/explore">Explore developers</Link>
              </Button>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold tracking-tight">
                    {s.value}
                  </dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            <FeedPreview />
          </motion.div>
        </div>
      </section>

      {/* Philosophy strip */}
      <section className="border-y border-border/50 bg-muted/25">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed sm:text-xl">
            Instagram shows what people are{" "}
            <span className="text-muted-foreground">doing.</span>
            <br />
            DevLoop shows what developers are{" "}
            <span className="gradient-text font-semibold">building.</span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built for the way developers actually share
          </h2>
          <p className="mt-3 text-muted-foreground">
            Not another feed of screenshots. Every feature exists to make what
            you build legible to other engineers.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
              className="group rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/35 hover:bg-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-background text-primary transition-transform group-hover:scale-105">
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start your build streak today
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Post the thing you shipped this week. Someone out there is trying
              to solve exactly that.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="gradient" size="lg" asChild>
                <Link to="/register">
                  Create your account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link to="/login">I already have one</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 py-8 sm:flex-row sm:px-8">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground sm:ml-auto">
            DevLoop · Built for developers, by developers. ©{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
