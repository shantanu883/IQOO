import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, DEMO_MODE } from "@/lib/api";
import { validateEmail } from "@/lib/validation";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const err = validateEmail(email);
    setError(err);
    if (err) return;

    setSubmitting(true);
    try {
      const res = await api.requestPasswordReset(email.trim().toLowerCase());
      setMessage(res.message);
      setSentTo(email.trim().toLowerCase());
    } catch (e2) {
      toast({
        variant: "destructive",
        title: "Couldn't send the reset link",
        description: e2 instanceof Error ? e2.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={message}
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        }
      >
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success/15 text-success">
              <MailCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">Sent to {sentTo}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                The link expires in 30 minutes. Check your spam folder if it
                hasn't arrived within a few minutes.
              </p>
            </div>
          </div>

          {DEMO_MODE && (
            <p className="mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              Demo mode has no mail transport, so no email was actually sent.
              Configure <code className="font-mono">SMTP_*</code> on the server
              to enable real delivery.
            </p>
          )}

          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => {
              setSentTo(null);
              setEmail("");
            }}
          >
            Use a different email
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email tied to your account and we'll send a reset link."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
          }}
          error={error}
          disabled={submitting}
          autoFocus
        />
        <Button
          type="submit"
          variant="gradient"
          className="h-11 w-full"
          disabled={submitting}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
