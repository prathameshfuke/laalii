import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Section } from "@/components/AppShell";
import { Mascot, phaseMascot } from "@/components/Mascot";
import { PHASES, phaseFor, predict } from "@/lib/cycle";
import { useCycles, useProfile } from "@/lib/data";
import { today } from "@/lib/cycle";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({
    meta: [
      { title: "Learn: Laali" },
      { name: "description", content: "Plain-language notes on each phase of your cycle." },
      { property: "og:title", content: "Learn: Laali" },
      { property: "og:description", content: "Understand each phase of your cycle." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearnPage,
});

const DETAIL: Record<keyof typeof PHASES, string[]> = {
  menstrual: [
    "The lining sheds; hormones sit at their lowest.",
    "Energy often dips. Rest is not laziness here.",
    "Warmth, iron-rich food and gentle movement tend to help.",
  ],
  follicular: [
    "Oestrogen climbs and follicles mature.",
    "Many people feel clearer, lighter, more social.",
    "A good stretch for starting things and harder training.",
  ],
  ovulation: [
    "An egg is released; oestrogen peaks then drops.",
    "Peak fertility sits in the few days before, not after.",
    "Some notice a twinge on one side or a change in discharge.",
  ],
  luteal: [
    "Progesterone rises then falls if there's no pregnancy.",
    "Appetite, sleep and mood can all shift in the back half.",
    "Steady routines and less caffeine often soften the landing.",
  ],
};

function LearnPage() {
  const profile = useProfile();
  const cycles = useCycles();
  const opts = {
    avgCycleLength: profile.data?.avg_cycle_length ?? 28,
    lutealLength: profile.data?.luteal_length ?? 14,
  };
  const p = predict(cycles.data ?? [], opts);
  const info = phaseFor(today(), cycles.data ?? [], opts);

  return (
    <AppShell variant="her">
      <Section>
        <h1 className="text-3xl">Learn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Four phases, in plain language. Your body won't follow them to the day, and that's normal.
        </p>
      </Section>

      <div className="mt-6 space-y-4">
        {(Object.keys(PHASES) as Array<keyof typeof PHASES>).map((phase) => (
          <article
            key={phase}
            className="paper p-5"
            style={{ background: PHASES[phase].soft }}
          >
            <div className="flex items-center gap-3">
              <Mascot state={phaseMascot[phase]} size={56} />
              <div>
                <h2 className="text-xl">{PHASES[phase].label}</h2>
                {info?.phase === phase ? (
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    You're here today
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-sm">{PHASES[phase].blurb}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {DETAIL[phase].map((line) => (
                <li key={line} className="flex gap-2">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: PHASES[phase].color }}
                  />
                  {line}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <Section>
        <p className="text-xs text-muted-foreground">
          Based on a {Math.round(p.cycleLength)}-day cycle with a {p.lutealLength}-day luteal phase.
          Laali is not a medical device. See a clinician for anything that worries you.
        </p>
      </Section>
    </AppShell>
  );
}
