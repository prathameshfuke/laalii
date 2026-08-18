import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAcceptInvite, useProfile, useUpdateProfile } from "@/lib/data";
import { PARTNER_STEPS, resumeStep } from "@/lib/routing";

export const Route = createFileRoute("/_authenticated/partner-setup")({
  head: () => ({
    meta: [
      { title: "Set up your partner view: Laali" },
      {
        name: "description",
        content: "Add your name and connect to your partner's cycle with their invite code.",
      },
      { property: "og:title", content: "Set up your partner view: Laali" },
      {
        property: "og:description",
        content: "Connect with a six character code and see only what your partner shares.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerSetup,
});

function PartnerSetup() {
  const navigate = useNavigate();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const acceptInvite = useAcceptInvite();

  const [step, setStep] = useState(() => resumeStep(PARTNER_STEPS, profile.data?.onboarding_step));
  const [name, setName] = useState(profile.data?.display_name ?? "");
  const [birthYear, setBirthYear] = useState(
    profile.data?.birth_year ? String(profile.data.birth_year) : "",
  );
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const current = PARTNER_STEPS[step]!;

  async function goTo(next: number) {
    setStep(next);
    const name = PARTNER_STEPS[next];
    if (name) updateProfile.mutate({ onboarding_step: name });
  }

  async function saveBasics() {
    setBusy(true);
    try {
      const year = Number(birthYear);
      await updateProfile.mutateAsync({
        display_name: name.trim() || null,
        birth_year: Number.isFinite(year) && year > 1900 ? year : null,
        onboarding_step: "pair",
      });
      setStep(1);
    } catch (error) {
      toast.error("Could not save that", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function finish(withCode: boolean) {
    setBusy(true);
    try {
      if (withCode) {
        await acceptInvite.mutateAsync(code);
        toast.success("You are connected");
      }
      await updateProfile.mutateAsync({ onboarded: true, onboarding_step: null });
      navigate({ to: "/partner", replace: true });
    } catch (error) {
      toast.error("That did not work", {
        description: error instanceof Error ? error.message : "Please check the code and try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="partner-skin min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-sm flex-col">
        <img src={logo.url} alt="Laali" className="mx-auto h-7 w-auto" />

        <div className="mt-6 flex gap-1.5">
          {PARTNER_STEPS.map((s, i) => (
            <span
              key={s}
              className="h-1 flex-1 rounded-full"
              style={{ background: i <= step ? "var(--primary)" : "var(--border)" }}
            />
          ))}
        </div>

        <div key={current} className="rise mt-10 flex-1">
          {current === "basics" ? (
            <div>
              <Mascot state="comforted" size={120} className="mx-auto" />
              <h1 className="mt-6 text-2xl">First, a little about you</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Only your name is shown to your partner. Everything else stays on your side.
              </p>
              <Label htmlFor="pname" className="mt-6 block">
                Your name
              </Label>
              <Input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-12 rounded-xl"
                placeholder="Optional"
              />
              <Label htmlFor="pyear" className="mt-5 block">
                Year of birth
              </Label>
              <Input
                id="pyear"
                inputMode="numeric"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="mt-1.5 h-12 rounded-xl"
                placeholder="Optional"
              />
            </div>
          ) : null}

          {current === "pair" ? (
            <div>
              <Mascot state="distracted" size={120} className="mx-auto" />
              <h1 className="mt-6 text-2xl">Enter your partner's code</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                They will find a six character code in their Laali under Settings, Couples Mode.
              </p>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                className="numeral mt-6 h-14 rounded-xl text-center text-2xl tracking-[0.3em]"
              />
              <p className="mt-4 text-xs text-muted-foreground">
                You will only ever see what they switch on, and they can switch it off at any time.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          {current === "basics" ? (
            <Button className="h-12 w-full rounded-full text-base" disabled={busy} onClick={saveBasics}>
              Continue
            </Button>
          ) : (
            <>
              <Button
                className="h-12 w-full rounded-full text-base"
                disabled={busy || code.length < 4}
                onClick={() => finish(true)}
              >
                {busy ? "Connecting" : "Connect"}
              </Button>
              <button
                className="w-full text-center text-sm text-muted-foreground"
                disabled={busy}
                onClick={() => finish(false)}
              >
                I do not have a code yet
              </button>
            </>
          )}
          {step > 0 ? (
            <button
              className="w-full text-center text-sm text-muted-foreground"
              onClick={() => goTo(step - 1)}
            >
              Back
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
