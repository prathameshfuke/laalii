import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, toISO, today } from "@/lib/cycle";
import { useProfile, useStartPeriod, useUpdateProfile } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Getting started — Laali" },
      { name: "description", content: "A few gentle questions to set up your cycle." },
      { property: "og:title", content: "Getting started — Laali" },
      { property: "og:description", content: "Set up your Laali cycle." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["welcome", "name", "history", "length", "done"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const startPeriod = useStartPeriod();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [mascotName, setMascotName] = useState("Laali");
  const [lastPeriod, setLastPeriod] = useState(toISO(addDays(today(), -14)));
  const [length, setLength] = useState(28);
  const [importCount, setImportCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const current = STEPS[step]!;

  async function finish() {
    setBusy(true);
    try {
      await updateProfile.mutateAsync({
        display_name: name.trim() || profile.data?.display_name || null,
        mascot_name: mascotName.trim() || "Laali",
        avg_cycle_length: length,
        onboarded: true,
      });
      // seed the given start plus any prior cycles the user wants brought over
      for (let i = 0; i <= importCount; i++) {
        const start = addDays(new Date(lastPeriod), -i * length);
        await startPeriod.mutateAsync(toISO(start));
      }
      navigate({ to: "/home", replace: true });
    } catch (error) {
      toast.error("Couldn't save that", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-sm flex-col">
        <img src={logo.url} alt="Laali" className="mx-auto h-7 w-auto" />

        <div className="mt-6 flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--rose)" : "var(--border)" }}
            />
          ))}
        </div>

        <div key={current} className="rise mt-10 flex-1">
          {current === "welcome" ? (
            <div className="text-center">
              <Mascot state="celebratory" size={170} className="mx-auto" bob />
              <h1 className="mt-6 text-3xl">Welcome to Laali</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Four short questions. Nothing here is ever shared unless you say so.
              </p>
            </div>
          ) : null}

          {current === "name" ? (
            <div>
              <Mascot state="neutral" size={120} className="mx-auto" />
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
              <Label htmlFor="m" className="mt-5 block">
                And your little companion?
              </Label>
              <Input
                id="m"
                value={mascotName}
                onChange={(e) => setMascotName(e.target.value)}
                className="mt-1.5 h-12 rounded-xl"
              />
            </div>
          ) : null}

          {current === "history" ? (
            <div>
              <Mascot state="distracted" size={120} className="mx-auto" />
              <h1 className="mt-6 text-2xl">When did your last period start?</h1>
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
                      background: importCount === n ? "color-mix(in oklab, var(--rose) 18%, transparent)" : "var(--card)",
                    }}
                  >
                    {n === 0 ? "Start fresh" : `${n} past cycles`}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Estimated evenly from your average length — you can edit or delete any of them later.
              </p>
            </div>
          ) : null}

          {current === "length" ? (
            <div>
              <Mascot state="energetic" size={120} className="mx-auto" />
              <h1 className="mt-6 text-2xl">How long is your usual cycle?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                First day of one period to the first day of the next. A guess is fine — Laali learns.
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
              />
            </div>
          ) : null}

          {current === "done" ? (
            <div className="text-center">
              <Mascot state="celebratory" size={170} className="mx-auto" bob />
              <h1 className="mt-6 text-3xl">You're all set</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Your ring is ready. When you want to bring your partner in, you'll find it in
                Settings — you choose exactly what they see.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          <Button
            className="h-12 w-full rounded-full text-base"
            disabled={busy}
            onClick={() => (step === STEPS.length - 1 ? finish() : setStep(step + 1))}
          >
            {step === STEPS.length - 1 ? (busy ? "Setting up…" : "Open my tracker") : "Continue"}
          </Button>
          {step > 0 ? (
            <button
              className="w-full text-center text-sm text-muted-foreground"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
