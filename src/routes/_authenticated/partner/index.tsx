import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Section } from "@/components/AppShell";
import { Mascot, phaseMascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PHASES, formatDay, fromISO, phaseFor, predict, today } from "@/lib/cycle";
import {
  useAcceptInvite,
  useCycles,
  useLinksToMe,
  usePartnerLogs,
  useOwnerProfile,
  usePartnerNotes,
  useSendNote,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/partner/")({
  head: () => ({
    meta: [
      { title: "Partner: Laali" },
      { name: "description", content: "A gentle window into your partner's cycle, only what they share." },
      { property: "og:title", content: "Partner: Laali" },
      { property: "og:description", content: "Support, at the right moment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerHome,
});

function PartnerHome() {
  const links = useLinksToMe();
  const accept = useAcceptInvite();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const link = (links.data ?? [])[0] ?? null;
  const owner = useOwnerProfile(link?.owner_id);
  const cycles = useCycles(link?.owner_id);
  const logs = usePartnerLogs(link?.owner_id, !!link?.share_mood || !!link?.share_symptoms);
  const notes = usePartnerNotes(link?.id);
  const sendNote = useSendNote();
  const [draft, setDraft] = useState("");

  if (!link) {
    return (
      <AppShell variant="his">
        <Section>
          <div className="paper mt-10 p-6 text-center">
            <Mascot state="neutral" size={130} className="mx-auto" bob />
            <h1 className="mt-5 text-2xl">Connect with your partner</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask her for the six-character invite code from her Laali settings.
            </p>
            <Input
              value={code}
              onChange={(e) => {
                setCode(normalizeCode(e.target.value));
                setCodeError(null);
              }}
              placeholder="ABC123"
              maxLength={INVITE_LENGTH}
              aria-invalid={!!codeError}
              aria-describedby={codeError ? "code-error" : undefined}
              className="numeral mt-5 h-12 rounded-xl text-center text-xl tracking-[0.3em]"
              style={codeError ? { borderColor: "var(--destructive)" } : undefined}
            />
            {codeError ? (
              <p id="code-error" role="alert" className="mt-2 text-xs text-destructive">
                {codeError}
              </p>
            ) : null}
            <Button
              className="mt-3 h-12 w-full rounded-full"
              disabled={!isCompleteCode(code) || accept.isPending}
              onClick={() => {
                setCodeError(null);
                accept.mutate(normalizeCode(code), {
                  onSuccess: () => toast.success("You're connected"),
                  onError: (e) => {
                    const message = inviteErrorMessage(e);
                    setCodeError(message);
                    toast.error("Couldn't connect", { description: message });
                  },
                });
              }}
            >
              {accept.isPending ? "Connecting…" : "Connect"}
            </Button>
          </div>
        </Section>
      </AppShell>
    );
  }


  const opts = {
    avgCycleLength: owner.data?.avg_cycle_length ?? 28,
    lutealLength: owner.data?.luteal_length ?? 14,
  };
  const rows = cycles.data ?? [];
  const p = predict(rows, opts);
  const info = phaseFor(today(), rows, opts);
  const her = owner.data?.display_name ?? "She";

  const recentMoods = (logs.data ?? [])
    .slice(0, 3)
    .flatMap((l) => (link.share_mood ? l.moods : []))
    .slice(0, 4);
  const recentSymptoms = (logs.data ?? [])
    .slice(0, 3)
    .flatMap((l) => (link.share_symptoms ? l.symptoms : []))
    .slice(0, 4);

  return (
    <AppShell variant="his">
      <Section>
        <h1 className="text-3xl">{her} today</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only what she's chosen to share. No notes, no full history.
        </p>
      </Section>

      {link.share_phase && info ? (
        <Section>
          <div className="paper flex items-center gap-4 p-5" style={{ background: PHASES[info.phase].soft }}>
            <Mascot state={phaseMascot[info.phase]} size={78} />
            <div>
              <p className="text-xl">{PHASES[info.phase].label} phase</p>
              <p className="mt-1 text-sm text-muted-foreground">{PHASES[info.phase].blurb}</p>
              {p.nextStart ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Next period around {formatDay(p.nextStart)}
                </p>
              ) : null}
            </div>
          </div>
        </Section>
      ) : (
        <Section>
          <div className="paper p-5 text-sm text-muted-foreground">
            She hasn't turned on phase sharing yet, and that is completely her call.
          </div>
        </Section>
      )}

      {recentMoods.length ? (
        <Section title="Recently felt">
          <div className="flex flex-wrap gap-2">
            {recentMoods.map((m, i) => (
              <span key={`${m}-${i}`} className="paper px-4 py-2 text-sm">
                {m}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {recentSymptoms.length ? (
        <Section title="Body notes">
          <div className="flex flex-wrap gap-2">
            {recentSymptoms.map((s, i) => (
              <span key={`${s}-${i}`} className="paper px-4 py-2 text-sm">
                {s}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Ways to help right now">
        <ul className="paper space-y-2 p-5 text-sm">
          {(info ? HELP[info.phase] : HELP.luteal).map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
              {tip}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Send a note">
        <div className="paper p-4">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Thinking of you today"
            className="h-11 rounded-xl"
          />
          <Button
            className="mt-3 h-11 w-full rounded-full"
            disabled={!draft.trim() || sendNote.isPending}
            onClick={() =>
              sendNote.mutate(
                { linkId: link.id, body: draft.trim() },
                {
                  onSuccess: () => {
                    setDraft("");
                    toast.success("Sent");
                  },
                  onError: () => toast.error("Couldn't send that"),
                },
              )
            }
          >
            Send
          </Button>
          {(notes.data ?? []).length ? (
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {(notes.data ?? []).slice(0, 3).map((n) => (
                <li key={n.id} className="rounded-xl bg-background/60 px-3 py-2">
                  "{n.body}"
                  <span className="ml-2 text-xs">{formatDay(fromISO(n.created_at.slice(0, 10)))}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Section>
    </AppShell>
  );
}

const HELP: Record<keyof typeof PHASES, string[]> = {
  menstrual: [
    "Warmth helps: a hot water bottle, a blanket, a quiet evening.",
    "Take something off her plate without being asked.",
    "Lower the bar for plans. Rest is the win.",
  ],
  follicular: [
    "Energy is climbing, a good week to plan something together.",
    "Say yes to the spontaneous idea.",
  ],
  ovulation: [
    "Confidence and energy usually peak here.",
    "Good time for the bigger conversations and the fun ones.",
  ],
  luteal: [
    "Patience over problem-solving. Ask before fixing.",
    "Snacks, early nights and fewer last-minute changes.",
    "If she's short, it's often the hormones talking, not you.",
  ],
};
