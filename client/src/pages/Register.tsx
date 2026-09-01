import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, PasswordField } from "@/components/auth/Field";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  passwordStrength,
  suggestUsername,
  validateEmail,
  validateFullName,
  validatePassword,
  validateUsername,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

interface Errors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
}

const STRENGTH_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-amber-500",
  "bg-amber-400",
  "bg-success",
];

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  /** Stop auto-filling the username once the user edits it themselves. */
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const handleFullName = (value: string) => {
    setFullName(value);
    clearError("fullName");
    if (!usernameTouched) setUsername(suggestUsername(value));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const next: Errors = {
      fullName: validateFullName(fullName),
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });
      toast({
        variant: "success",
        title: "Account created",
        description: "Let's set up your developer profile.",
      });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't create your account",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your developer account"
      subtitle="Share what you build, showcase projects and find people to build with."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons onDemoSignedIn={() => navigate("/", { replace: true })} disabled={submitting} />

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or sign up with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field
          label="Full name"
          autoComplete="name"
          placeholder="Shantanu Sharma"
          value={fullName}
          onChange={(e) => handleFullName(e.target.value)}
          error={errors.fullName}
          disabled={submitting}
        />

        <Field
          label="Username"
          autoComplete="username"
          placeholder="shantanu_dev"
          value={username}
          onChange={(e) => {
            setUsernameTouched(true);
            setUsername(e.target.value.toLowerCase());
            clearError("username");
          }}
          error={errors.username}
          hint={
            username ? `devloop.app/u/${username}` : "Lowercase, 3–20 characters"
          }
          disabled={submitting}
        />

        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
          error={errors.email}
          disabled={submitting}
        />

        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            error={errors.password}
            disabled={submitting}
          />
          {password && !errors.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < strength.score
                        ? STRENGTH_COLORS[strength.score]
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className="w-14 text-right text-[11px] text-muted-foreground">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          className="h-11 w-full"
          disabled={submitting}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By joining you agree to keep DevLoop a constructive place for
          developers to learn and build.
        </p>
      </form>
    </AuthShell>
  );
}
