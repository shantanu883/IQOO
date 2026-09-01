import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubMark, GoogleMark } from "@/components/common/BrandIcons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

type Provider = "github" | "google";

interface Props {
  /** Called after a successful demo-mode sign-in. */
  onDemoSignedIn: () => void;
  disabled?: boolean;
}

/**
 * Google / GitHub sign-in.
 *
 * The backend owns the real handshake, so we ask it for the authorize URL
 * and redirect. In demo mode there is no OAuth provider to talk to, so the
 * API reports `demo: true` and we sign in as the sample account instead —
 * clearly surfaced in a toast rather than silently faked.
 */
export function OAuthButtons({ onDemoSignedIn, disabled }: Props) {
  const { loginDemo } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<Provider | null>(null);

  const start = async (provider: Provider) => {
    if (pending) return;
    setPending(provider);
    try {
      const { url, demo } = await api.oauthUrl(provider);

      if (demo) {
        await loginDemo();
        toast({
          title: "Signed in with the demo account",
          description: `Real ${
            provider === "github" ? "GitHub" : "Google"
          } sign-in activates once you add OAuth credentials to the server.`,
        });
        onDemoSignedIn();
        return;
      }

      // Full-page redirect: the provider's consent screen can't run in an iframe.
      window.location.href = url;
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Couldn't start sign-in",
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => start("github")}
        disabled={disabled || pending !== null}
        className="h-11"
      >
        {pending === "github" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GithubMark className="h-4 w-4" />
        )}
        GitHub
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => start("google")}
        disabled={disabled || pending !== null}
        className="h-11"
      >
        {pending === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleMark className="h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}
