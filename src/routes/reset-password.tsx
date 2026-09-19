import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password: Laali" },
      { name: "description", content: "Set a new password for your Laali account." },
      { property: "og:title", content: "Choose a new password: Laali" },
      { property: "og:description", content: "Set a new password for your Laali account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The recovery link drops a session on this page. Wait for it before letting
  // anyone set a password, otherwise the save quietly fails.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      toast.success("Password updated");
      navigate({ to: "/auth", search: {}, replace: true });
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "We could not change the password. Please open the link again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <Mascot state="neutral" size={120} className="mx-auto" />
        <h1 className="mt-6 text-2xl">Choose a new password</h1>
        {ready ? (
          <form onSubmit={save} className="mt-6 text-left">
            <Label htmlFor="np">New password</Label>
            <Input
              id="np"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="mt-1.5 h-12 rounded-xl"
            />
            {error ? (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={busy} className="mt-5 h-12 w-full rounded-full">
              {busy ? "Saving" : "Save password"}
            </Button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Open this page from the reset link in your email. If you came here another way, ask for
            a fresh link from the sign in page.
          </p>
        )}
      </div>
    </div>
  );
}
