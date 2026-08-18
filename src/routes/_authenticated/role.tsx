import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { useUpdateProfile, type UserRole } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/role")({
  head: () => ({
    meta: [
      { title: "Who is this for? Laali" },
      {
        name: "description",
        content: "Choose whether you are tracking your own cycle or supporting a partner.",
      },
      { property: "og:title", content: "Who is this for? Laali" },
      {
        property: "og:description",
        content: "Laali sets itself up differently depending on which side you are on.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RolePage,
});

const OPTIONS: Array<{
  value: UserRole;
  title: string;
  body: string;
  mascot: "neutral" | "comforted";
}> = [
  {
    value: "primary",
    title: "I am tracking my cycle",
    body: "The full tracker: your ring, your logs, your insights. You decide later whether anyone else sees a thing.",
    mascot: "neutral",
  },
  {
    value: "partner",
    title: "I am supporting a partner",
    body: "A quieter view built around them. You will need a code from their app to connect.",
    mascot: "comforted",
  },
];

function RolePage() {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const [choice, setChoice] = useState<UserRole | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!choice) return;
    setBusy(true);
    try {
      await updateProfile.mutateAsync({ role: choice, onboarding_step: "basics" });
      navigate({ to: choice === "primary" ? "/onboarding" : "/partner-setup", replace: true });
    } catch (error) {
      toast.error("Could not save that", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-sm flex-col">
        <img src={logo.url} alt="Laali" className="mx-auto h-7 w-auto" />

        <div className="rise mt-10 flex-1">
          <h1 className="text-3xl">Is this your app, or are you supporting a partner?</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This sets up two quite different versions of Laali. You can change it later in Settings.
          </p>

          <div className="mt-7 space-y-3">
            {OPTIONS.map((o) => {
              const active = choice === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setChoice(o.value)}
                  aria-pressed={active}
                  className="flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition-colors"
                  style={{
                    borderColor: active ? "var(--ink)" : "var(--border)",
                    background: active
                      ? "color-mix(in oklab, var(--rose) 16%, transparent)"
                      : "var(--card)",
                  }}
                >
                  <Mascot state={o.mascot} size={64} />
                  <span className="flex-1">
                    <span className="block text-base font-semibold">{o.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{o.body}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          className="mt-8 h-12 w-full rounded-full text-base"
          disabled={!choice || busy}
          onClick={confirm}
        >
          {busy ? "Setting up" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
