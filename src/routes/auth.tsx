import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { profileQuery } from "@/lib/data";
import { destinationFor } from "@/lib/routing";


export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { role?: "partner" } =>
    search["role"] === "partner" ? { role: "partner" } : {},

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
  const { role: intendedRole } = Route.useSearch();
  const partnerFlow = intendedRole === "partner";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  /**
   * One place decides where a signed-in person lands, so role selection is
   * always the first stop for a brand new account and never reappears later.
   * Arriving through the partner entry presets the role, so a supporter never
   * has to answer the role question.
   */
  async function land() {
    qc.removeQueries({ queryKey: profileQuery.queryKey });
    let profile = await qc.ensureQueryData(profileQuery);
    if (partnerFlow && profile && !profile.role) {
      const { data } = await supabase
        .from("profiles")
        .update({ role: "partner", onboarding_step: "basics" })
        .eq("id", profile.id)
        .select()
        .maybeSingle();
      if (data) {
        profile = data as typeof profile;
        qc.setQueryData(profileQuery.queryKey, profile);
      }
    }
    navigate({ to: destinationFor(profile), replace: true });
  }

  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      void land();
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
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await land();
    } catch (error) {
      toast.error("That didn't work", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    await land();
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
            ? "Create your own account, then enter the code your partner shared with you."
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-12 rounded-xl"
            />
          </div>
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-full text-base">
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="outline"
          onClick={google}
          className="h-12 w-full rounded-full border-border bg-card text-base"
        >
          Continue with Google
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
