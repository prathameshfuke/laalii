import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, toISO, today } from "@/lib/cycle";
import {
  useCreateInvite,
  useMyLinks,
  useProfile,
  useStartPeriod,
  useUpdateProfile,
  type Intent,
} from "@/lib/data";
import { PRIMARY_STEPS, resumeStep } from "@/lib/routing";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Getting started: Laali" },
      { name: "description", content: "A few gentle questions to set up your cycle in Laali." },
      { property: "og:title", content: "Getting started: Laali" },
      {
        property: "og:description",
        content: "Set up your cycle, your goal and your reminders. Skip anything you like.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Onboarding,
});

const INTENTS: Array<{ value: Intent; label: string; body: string }> = [
  { value: "tracking", label: "Just tracking", body: "Know where you are, week to week." },
  { value: "conceive", label: "Trying to conceive", body: "Fertile window front and centre." },
  { value: "avoid", label: "Avoiding pregnancy", body: "Laali is never contraception, but it will be clear about risk days." },
];

function Onboarding() {
  const navigate = useNavigate();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const startPeriod = useStartPeriod();
  const links = useMyLinks();
  const createInvite = useCreateInvite();

  const [step, setStep] = useState(() => resumeStep(PRIMARY_STEPS, profile.data?.onboarding_step));
  const [name, setName] = useState(profile.data?.display_name ?? "");
  const [mascotName, setMascotName] = useState(profile.data?.mascot_name ?? "Laali");
  const [birthYear, setBirthYear] = useState(
    profile.data?.birth_year ? String(profile.data.birth_year) : "",
  );
  const [intent, setIntent] = useState<Intent>(profile.data?.intent ?? "tracking");
  const [length, setLength] = useState(profile.data?.avg_cycle_length ?? 28);
  const [lengthKnown, setLengthKnown] = useState(true);
  const [lastPeriod, setLastPeriod] = useState(toISO(addDays(today(), -14)));
  const [importCount, setImportCount] = useState(0);
  const [skipHistory, setSkipHistory] = useState(false);
  const [reminders, setReminders] = useState<"on" | "off" | null>(null);
  const [busy, setBusy] = useState(false);

  const current = PRIMARY_STEPS[step]!;
  const pendingLink = (links.data ?? []).find((l) => !l.partner_id);

  function go(next: number) {
    setStep(next);
    const stepName = PRIMARY_STEPS[next];
    if (stepName) updateProfile.mutate({ onboarding_step: stepName });
  }

  async function saveBasics() {
    setBusy(true);
    try {
      const year = Number(birthYear);
      await updateProfile.mutateAsync({
        display_name: name.trim() || null,
        mascot_name: mascotName.trim() || "Laali",
        birth_year: Number.isFinite(year) && year > 1900 ? year : null,
        intent,
        onboarding_step: "length",
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

  async function saveLength(skipped: boolean) {
    setBusy(true);
    try {
      await updateProfile.mutateAsync({
        avg_cycle_length: skipped ? 28 : length,
        onboarding_step: "history",
      });
      setLengthKnown(!skipped);
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  async function saveHistory(skipped: boolean) {
    setBusy(true);
    try {
      if (!skipped) {
        const base = new Date(lastPeriod);
        for (let i = 0; i <= importCount; i++) {
          await startPeriod.mutateAsync(toISO(addDays(base, -i * length)));
        }
      }
      setSkipHistory(skipped);
      await updateProfile.mutateAsync({ onboarding_step: "reminders" });
      setStep(3);
    } catch (error) {
      toast.error("Could not save your history", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function chooseReminders(on: boolean) {
    setReminders(on ? "on" : "off");
    if (on && typeof Notification !== "undefined") {
      try {
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          toast.message("Reminders are off for now", {
            description: "You can turn them on from your browser settings whenever you want.",
          });
        }
      } catch {
        /* some browsers refuse outside a user gesture, that is fine */
      }
    }
    updateProfile.mutate({ onboarding_step: "couples" });
    setStep(4);
  }

  async function ensureCode() {
    if (pendingLink) return;
    try {
      await createInvite.mutateAsync({ share_phase: true });
    } catch (error) {
      toast.error("Could not make a code", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function finish() {
    setBusy(true);
    try {
      await updateProfile.mutateAsync({ onboarded: true, onboarding_step: null });
      navigate({ to: "/home", replace: true });
    } catch (error) {
      toast.error("Could not finish setting up", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-sm flex-col">
        <img src={logo.url} alt="Laali" className="mx-auto h-7 w-auto" />

        <div className="mt-6 flex gap-1.5">
          {PRIMARY_STEPS.map((s, i) => (
            <span
              key={s}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--rose)" : "var(--border)" }}
            />
          ))}
        </div>

        <div key={current} className="rise mt-10 flex-1">
          {current === "basics" ? (
            <div>
              <Mascot state="neutral" size={110} className="mx-auto" />
              <h1 className="mt-6 text-2xl">What should we call you?</h1>
              <Label htmlFor="n" className="mt-6 block">
                Your name
              </Label>
              <Input
                id="n"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-12 rounded-xl"
                placeholder="Optional"
              />
              <Label htmlFor="y" className="mt-5 block">
                Year of birth
              </Label>
              <Input
                id="y"
                inputMode="numeric"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="mt-1.5 h-12 rounded-xl"
                placeholder="Optional"
              />
              <Label htmlFor="m" className="mt-5 block">
                And your little companion?
              </Label>
              <Input
                id="m"
                value={mascotName}
                onChange={(e) => setMascotName(e.target.value)}
                className="mt-1.5 h-12 rounded-xl"
              />
              <p className="mt-6 text-sm font-semibold">What brings you here?</p>
              <div className="mt-3 space-y-2">
                {INTENTS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setIntent(o.value)}
                    aria-pressed={intent === o.value}
                    className="w-full rounded-2xl border p-3 text-left"
                    style={{
                      borderColor: intent === o.value ? "var(--ink)" : "var(--border)",
                      background:
                        intent === o.value
                          ? "color-mix(in oklab, var(--rose) 16%, transparent)"
                          : "var(--card)",
                    }}
                  >
                    <span className="block text-sm font-semibold">{o.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{o.body}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {current === "length" ? (
            <div>
              <Mascot state="energetic" size={110} className="mx-auto" />
              <h1 className="mt-6 text-2xl">How long is your usual cycle?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                First day of one period to the first day of the next. A guess is fine, Laali learns
                from what you log.
              </p>
              <div className="mt-8 text-center">
                <span className="numeral text-6xl">{length}</span>
                <span className="ml-2 text-sm text-muted-foreground">days</span>
              </div>
              <input
                type="range"
                min={20}
                max={45}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="mt-6 w-full accent-[var(--rose)]"
                aria-label="Average cycle length in days"
              />
            </div>
          ) : null}

          {current === "history" ? (
            <div>
              <Mascot state="distracted" size={110} className="mx-auto" />
              <h1 className="mt-6 text-2xl">When did your last period start?</h1>
              {!lengthKnown ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  You skipped cycle length, so Laali will start from 28 days and adjust as you log.
                </p>
              ) : null}
              <Input
                type="date"
                value={lastPeriod}
                max={toISO(today())}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="mt-5 h-12 rounded-xl"
              />
              <p className="mt-6 text-sm font-semibold">Bring some history over?</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[0, 3, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setImportCount(n)}
                    className="rounded-2xl border px-3 py-4 text-center text-sm transition-colors"
                    style={{
                      borderColor: importCount === n ? "var(--ink)" : "var(--border)",
                      background:
                        importCount === n
                          ? "color-mix(in oklab, var(--rose) 18%, transparent)"
                          : "var(--card)",
                    }}
                  >
                    {n === 0 ? "Just this one" : `${n} past cycles`}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Past cycles are estimated evenly from your average length. You can edit or delete any
                of them later.
              </p>
            </div>
          ) : null}

          {current === "reminders" ? (
            <div>
              <Mascot state="sleepy" size={110} className="mx-auto" />
              <h1 className="mt-6 text-2xl">Want a nudge now and then?</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Laali can remind you when your period is due and give you a quiet prompt to log your
                day. Nothing is ever named on your lock screen, it just says Laali.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                You can change this later in Settings, and reminders work only while Laali is
                installed on this device.
              </p>
            </div>
          ) : null}

          {current === "couples" ? (
            <div>
              <Mascot state="celebratory" size={130} className="mx-auto" bob />
              <h1 className="mt-6 text-2xl">Bring your partner in?</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Couples Mode gives them a separate view that shows only what you switch on. By
                default that is your phase and nothing else. No notes, no intimacy, no full logs.
              </p>
              {pendingLink ? (
                <div className="paper mt-6 p-5 text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Your invite code
                  </p>
                  <p className="numeral mt-2 text-3xl tracking-[0.3em]">{pendingLink.invite_code}</p>
                  <button
                    className="mt-4 text-xs underline"
                    onClick={() => {
                      navigator.clipboard?.writeText(pendingLink.invite_code);
                      toast.success("Code copied");
                    }}
                  >
                    Copy code
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-6 h-12 w-full rounded-full"
                  disabled={createInvite.isPending}
                  onClick={ensureCode}
                >
                  {createInvite.isPending ? "Making a code" : "Create an invite code"}
                </Button>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Not now is completely fine. You will find this again in Settings, Couples Mode.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          {current === "basics" ? (
            <Button className="h-12 w-full rounded-full text-base" disabled={busy} onClick={saveBasics}>
              Continue
            </Button>
          ) : null}

          {current === "length" ? (
            <>
              <Button
                className="h-12 w-full rounded-full text-base"
                disabled={busy}
                onClick={() => saveLength(false)}
              >
                Continue
              </Button>
              <button
                className="w-full text-center text-sm text-muted-foreground"
                onClick={() => saveLength(true)}
              >
                I am not sure
              </button>
            </>
          ) : null}

          {current === "history" ? (
            <>
              <Button
                className="h-12 w-full rounded-full text-base"
                disabled={busy}
                onClick={() => saveHistory(false)}
              >
                {busy ? "Saving" : "Continue"}
              </Button>
              <button
                className="w-full text-center text-sm text-muted-foreground"
                onClick={() => saveHistory(true)}
              >
                Skip for now
              </button>
            </>
          ) : null}

          {current === "reminders" ? (
            <>
              <Button
                className="h-12 w-full rounded-full text-base"
                onClick={() => chooseReminders(true)}
              >
                Yes, remind me
              </Button>
              <button
                className="w-full text-center text-sm text-muted-foreground"
                onClick={() => chooseReminders(false)}
              >
                {reminders === "off" ? "Not now" : "No thanks"}
              </button>
            </>
          ) : null}

          {current === "couples" ? (
            <Button className="h-12 w-full rounded-full text-base" disabled={busy} onClick={finish}>
              {busy ? "Setting up" : "Open my tracker"}
            </Button>
          ) : null}

          {step > 0 ? (
            <button
              className="w-full text-center text-sm text-muted-foreground"
              onClick={() => go(step - 1)}
            >
              Back
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
