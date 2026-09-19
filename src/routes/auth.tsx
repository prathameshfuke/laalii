import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { profileQuery } from "@/lib/data";
import { authMessage } from "@/lib/auth-errors";
import { normalizeCode, stashCode } from "@/lib/invite";
import { destinationFor } from "@/lib/routing";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { role?: "partner"; code?: string } => {
    const out: { role?: "partner"; code?: string } = {};
    if (search["role"] === "partner") out.role = "partner";
    const code = normalizeCode(String(search["code"] ?? ""));
    if (code) out.code = code;
    return out;
  },

  head: () => ({
    meta: [
      { title: "Sign in: Laali" },
      { name: "description", content: "Sign in or create your Laali account to track your cycle." },
      { property: "og:title", content: "Sign in: Laali" },
      { property: "og:description", content: "Sign in or create your Laali account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});



function AuthPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { role: intendedRole, code: sharedCode } = Route.useSearch();
  const partnerFlow = intendedRole === "partner";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);

  // A shared invite link carries the code. Keep it for the pairing step, which
  // happens after sign in (and after the Google round trip).
  useEffect(() => {
    if (sharedCode) stashCode(sharedCode);
  }, [sharedCode]);

  /**
   * One place decides where a signed-in person lands, so role selection is
   * always the first stop for a brand new account and never reappears later.
   * Arriving through the partner entry presets the role, so a supporter never
   * has to answer the role question.
   */
  async function land() {
    let profile = await qc.fetchQuery(profileQuery);
    if (partnerFlow && profile && !profile.role) {
      try {
        const { data } = await supabase
          .from("profiles")
          .update({ role: "partner", onboarding_step: "basics" })
          .eq("id", profile.id)
          .select()
          .maybeSingle();
        if (data) {
          profile = data as typeof profile;
          qc.setQueryData(profileQuery.queryKey, profile);
        } else {
          profile = { ...profile, role: "partner", onboarding_step: "basics" };
          qc.setQueryData(profileQuery.queryKey, profile);
        }
      } catch {
        profile = { ...profile, role: "partner", onboarding_step: "basics" };
        qc.setQueryData(profileQuery.queryKey, profile);
      }
    }
    navigate({ to: destinationFor(profile), replace: true });
  }

  const inFlightLandRef = useRef<Promise<void> | null>(null);

  function executeLand() {
    if (!inFlightLandRef.current) {
      inFlightLandRef.current = land()
        .catch((error) => {
          console.error("Error loading account profile:", error);
          toast.error("We signed you in, but could not load your account", {
            description: error instanceof Error ? error.message : "Please try again.",
          });
        })
        .finally(() => {
          inFlightLandRef.current = null;
        });
    }
    return inFlightLandRef.current;
  }

  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      executeLand();
    };
    // A Google redirect lands back here, so watch for the session arriving as
    // well as checking for one that already exists.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) go();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFormError(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.href,
            data: { display_name: name.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      await executeLand();
    } catch (error) {
      const message = authMessage(error, mode);
      setFormError(message);
      toast.error("That did not work", { description: message });
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: window.location.href },
      });
      if (error) throw error;
      toast.success("Sent again", { description: `Check ${email} once more.` });
    } catch (error) {
      toast.error("Could not send it again", {
        description: authMessage(error, "signup"),
      });
    } finally {
      setResending(false);
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setFormError("Enter your email above first, then we can send a reset link.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent", { description: `Check ${email}.` });
    } catch (error) {
      toast.error("Could not send that", { description: authMessage(error, "signin") });
    }
  }

  async function google() {
    if (googleBusy) return;
    setGoogleBusy(true);
    setFormError(null);
    try {
      // Come back to this public page (keeping the partner intent and any
      // shared code) so we still know where to send them next.
      const params = new URLSearchParams();
      if (partnerFlow) params.set("role", "partner");
      if (sharedCode) params.set("code", sharedCode);
      const query = params.toString();
      const redirectUri = `${window.location.origin}/auth${query ? `?${query}` : ""}`;

      let result;
      try {
        result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: redirectUri,
        });
      } catch {
        result = { error: new Error("Lovable auth unavailable") };
      }

      if (result?.error) {
        // Fallback directly to Supabase OAuth
        const { error: sbOAuthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUri,
          },
        });
        if (sbOAuthError) {
          const message = authMessage(sbOAuthError, "signin");
          setFormError(message);
          toast.error("Google sign-in failed", { description: message });
          return;
        }
        return;
      }
      if (result?.redirected) return;
      await executeLand();
    } catch (error) {
      const message = authMessage(error, "signin");
      setFormError(message);
      toast.error("Google sign-in failed", { description: message });
    } finally {
      setGoogleBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <Mascot state="sleepy" size={140} className="mx-auto" />
          <h1 className="mt-6 text-2xl">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Open it and you'll land right back here.
          </p>
          <Button
            variant="outline"
            disabled={resending}
            onClick={resendConfirmation}
            className="mt-6 h-11 w-full rounded-full"
          >
            {resending ? "Sending" : "Send the email again"}
          </Button>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 w-full text-sm text-muted-foreground underline underline-offset-4"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Link to="/" className="flex justify-center">
          <img src={logo.url} alt="Laali" className="h-8 w-auto" />
        </Link>
        <Mascot state="neutral" size={110} className="mx-auto mt-6" bob />
        {partnerFlow ? (
          <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Partner sign in
          </p>
        ) : null}
        <h1 className="mt-3 text-center text-2xl">
          {mode === "signin" ? "Welcome back" : partnerFlow ? "Set up your partner account" : "Let's begin"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {partnerFlow
            ? sharedCode
              ? "Create your own account. We have kept their code, so pairing is one tap away."
              : "Create your own account, then enter the code your partner shared with you."
            : "Your cycle data is private to your account."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" ? (
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                autoComplete="name"
                className="mt-1.5 h-12 rounded-xl"
              />
            </div>
          ) : null}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormError(null);
              }}
              className="mt-1.5 h-12 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError(null);
              }}
              className="mt-1.5 h-12 rounded-xl"
            />
          </div>
          {formError ? (
            <p role="alert" className="text-xs text-destructive">
              {formError}
            </p>
          ) : null}
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-full text-base">
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {mode === "signin" ? (
          <button
            type="button"
            onClick={forgotPassword}
            className="mt-3 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Forgot your password?
          </button>
        ) : null}

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="outline"
          onClick={google}
          disabled={googleBusy}
          className="h-12 w-full rounded-full border-border bg-card text-base"
        >
          {googleBusy ? "Opening Google…" : "Continue with Google"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setFormError(null);
          }}
          className="mt-6 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>

        {!partnerFlow ? (
          <Link
            to="/auth"
            search={{ role: "partner" }}
            className="mt-4 block text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            I am the partner, not the one tracking
          </Link>
        ) : (
          <Link
            to="/auth"
            search={{}}
            className="mt-4 block text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            I am the one tracking
          </Link>
        )}
      </div>
    </div>
  );
}
