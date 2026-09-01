import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Rocket,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ChipSelect } from "@/components/common/ChipSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CORE_TECH_OPTIONS,
  MORE_TECH_OPTIONS,
  EXPERIENCE_LEVELS,
  INTEREST_OPTIONS,
} from "@/lib/options";
import type { ExperienceLevel } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = ["Technologies", "Experience", "Interests", "About you"] as const;

const MIN_TECH = 3;
const MIN_INTERESTS = 2;
const BIO_LIMIT = 200;

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [showAllTech, setShowAllTech] = useState(false);
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggle = (
    value: string,
    list: string[],
    setList: (next: string[]) => void
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );

  const techOptions = useMemo(
    () => (showAllTech ? [...CORE_TECH_OPTIONS, ...MORE_TECH_OPTIONS] : CORE_TECH_OPTIONS),
    [showAllTech]
  );

  /** Gate the "Continue" button per step. The last step is optional. */
  const canAdvance = [
    technologies.length >= MIN_TECH,
    experienceLevel !== null,
    interests.length >= MIN_INTERESTS,
    true,
  ][step];

  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    if (!experienceLevel || submitting) return;
    setSubmitting(true);
    try {
      await completeOnboarding({
        technologies,
        experienceLevel,
        interests,
        bio: bio.trim() || undefined,
        skills: technologies,
      });
      toast({
        variant: "success",
        title: "You're all set!",
        description: "Your feed is now tuned to what you build.",
      });
      navigate("/", { replace: true });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't save your profile",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => (isLast ? finish() : setStep((s) => s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8 sm:px-6 sm:py-12">
        <Logo size="md" className="mx-auto" />

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-medium">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  i === step
                    ? "text-primary"
                    : i < step
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold",
                    i < step
                      ? "border-primary bg-primary text-primary-foreground"
                      : i === step
                      ? "border-primary text-primary"
                      : "border-border"
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            ))}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="mt-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <section>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Hey {firstName} — what do you work with?
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pick at least {MIN_TECH}. We use these to shape your feed and
                    suggest developers building similar things.
                  </p>

                  <div className="mt-6">
                    <ChipSelect
                      options={techOptions}
                      selected={technologies}
                      onToggle={(v) => toggle(v, technologies, setTechnologies)}
                    />
                  </div>

                  {!showAllTech && (
                    <button
                      type="button"
                      onClick={() => setShowAllTech(true)}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Show {MORE_TECH_OPTIONS.length} more
                    </button>
                  )}

                  <p className="mt-5 text-xs text-muted-foreground">
                    {technologies.length} selected
                    {technologies.length < MIN_TECH &&
                      ` — ${MIN_TECH - technologies.length} to go`}
                  </p>
                </section>
              )}

              {step === 1 && (
                <section>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    How would you describe your experience?
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This helps us surface content at the right depth. You can
                    change it any time.
                  </p>

                  <div className="mt-6 space-y-3">
                    {EXPERIENCE_LEVELS.map((level) => {
                      const active = experienceLevel === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setExperienceLevel(level.value)}
                          className={cn(
                            "flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all",
                            active
                              ? "border-primary bg-primary/5 shadow-soft"
                              : "border-border hover:border-primary/40 hover:bg-accent"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                              active ? "border-primary bg-primary" : "border-border"
                            )}
                          >
                            {active && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">
                              {level.label}
                            </span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {level.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    What are you into?
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose at least {MIN_INTERESTS}. These drive your
                    recommendations and teammate matches.
                  </p>

                  <div className="mt-6">
                    <ChipSelect
                      options={INTEREST_OPTIONS}
                      selected={interests}
                      onToggle={(v) => toggle(v, interests, setInterests)}
                    />
                  </div>

                  <p className="mt-5 text-xs text-muted-foreground">
                    {interests.length} selected
                    {interests.length < MIN_INTERESTS &&
                      ` — ${MIN_INTERESTS - interests.length} to go`}
                  </p>
                </section>
              )}

              {step === 3 && (
                <section>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Add a short bio
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Optional, but profiles with a bio get followed far more often.
                  </p>

                  <div className="mt-6">
                    <Textarea
                      value={bio}
                      onChange={(e) =>
                        setBio(e.target.value.slice(0, BIO_LIMIT))
                      }
                      rows={4}
                      placeholder="Full-stack developer building AI tools. Currently learning Rust and shipping something small every week."
                      className="resize-none"
                      autoFocus
                    />
                    <p className="mt-1.5 text-right text-xs text-muted-foreground">
                      {bio.length}/{BIO_LIMIT}
                    </p>
                  </div>

                  <div className="mt-6 rounded-xl border border-border bg-card/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Your profile so far
                    </p>
                    <dl className="mt-3 space-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Technologies
                        </dt>
                        <dd className="mt-1.5 flex flex-wrap gap-1.5">
                          {technologies.map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Experience
                        </dt>
                        <dd className="mt-1 font-medium">{experienceLevel}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Interests
                        </dt>
                        <dd className="mt-1.5 flex flex-wrap gap-1.5">
                          {interests.map((i) => (
                            <Badge key={i} variant="muted">
                              {i}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-border/60 pt-5">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0 || submitting}
            className={cn(step === 0 && "invisible")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <Button
            variant="gradient"
            onClick={next}
            disabled={!canAdvance || submitting}
            className="min-w-[140px]"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLast ? (
              <Rocket className="h-4 w-4" />
            ) : null}
            {isLast ? "Enter DevLoop" : "Continue"}
            {!isLast && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
