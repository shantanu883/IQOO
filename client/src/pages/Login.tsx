import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, PasswordField } from "@/components/auth/Field";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validateEmail } from "@/lib/validation";
import type { User } from "@/types";

interface Errors {
  email?: string;
  password?: string;
}

export default function Login() {
  const { login, loginDemo, demoMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [demoPending, setDemoPending] = useState(false);

  /** Return to whatever route bounced the user to /login, else the feed. */
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/";

  const afterAuth = (user: User) => {
    navigate(user.onboarded ? redirectTo : "/onboarding", { replace: true });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const next: Errors = {
      email: validateEmail(email),
      password: password ? undefined : "Password is required.",
    };
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast({
        variant: "success",
        title: `Welcome back, ${user.fullName.split(" ")[0]}!`,
      });
      afterAuth(user);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sign-in failed",
        description:
          err instanceof Error ? err.message : "Check your details and retry.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startDemo = async () => {
    setDemoPending(true);
    try {
      const user = await loginDemo();
      toast({
        variant: "success",
        title: "Exploring as Shantanu",
        description: "You're signed into the sample account.",
      });
      afterAuth(user);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't start the demo",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setDemoPending(false);
    }
  };

  const busy = submitting || demoPending;

  return (
    <AuthShell
      title="Sign in to DevLoop"
      subtitle="Pick up where you left off — your feed, projects and streak are waiting."
      footer={
        <>
          New to DevLoop?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <OAuthButtons onDemoSignedIn={() => navigate(redirectTo, { replace: true })} disabled={busy} />

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or use email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          error={errors.email}
          disabled={busy}
        />

        <div>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((p) => ({ ...p, password: undefined }));
            }}
            error={errors.password}
            disabled={busy}
          />
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="gradient"
          className="h-11 w-full"
          disabled={busy}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      {demoMode && (
        <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Demo mode is on
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            No backend or API keys required — the app runs on a realistic sample
            dataset. Sign in with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
              shantanu@devloop.dev
            </code>{" "}
            /{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
              password123
            </code>
            , or jump straight in.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startDemo}
            disabled={busy}
            className="mt-3 w-full"
          >
            {demoPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Explore the demo account
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
