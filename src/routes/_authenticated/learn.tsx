import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Section } from "@/components/AppShell";
import { CardDeck } from "@/components/CardDeck";
import { phaseFor, predict, today } from "@/lib/cycle";
import { PARTNER_TOPICS, phaseCards } from "@/lib/learn-content";
import { useCycles, useProfile } from "@/lib/data";

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

function LearnPage() {
  const profile = useProfile();
  const cycles = useCycles();
  const opts = {
    avgCycleLength: profile.data?.avg_cycle_length ?? 28,
    lutealLength: profile.data?.luteal_length ?? 14,
  };
  const p = predict(cycles.data ?? [], opts);
  const info = phaseFor(today(), cycles.data ?? [], opts);

  const health = PARTNER_TOPICS.find((t) => t.id === "health");
  const talking = PARTNER_TOPICS.find((t) => t.id === "talking");

  return (
    <AppShell variant="her">
      <Section>
        <h1 className="text-3xl">Learn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Four phases, in plain language. Your body will not follow them to the day, and that is
          normal.
        </p>
      </Section>

      <Section title="Your phases" hint="swipe">
        <CardDeck cards={phaseCards(info?.phase ?? null, "You are here today")} />
      </Section>

      {talking ? (
        <Section title={talking.title} hint="swipe">
          <p className="mb-3 text-sm text-muted-foreground">{talking.blurb}</p>
          <CardDeck cards={talking.cards} />
        </Section>
      ) : null}

      {health ? (
        <Section title={health.title} hint="swipe">
          <p className="mb-3 text-sm text-muted-foreground">{health.blurb}</p>
          <CardDeck cards={health.cards} />
        </Section>
      ) : null}

      <Section>
        <p className="text-xs text-muted-foreground">
          Based on a {Math.round(p.cycleLength)}-day cycle with a {p.lutealLength}-day luteal phase.
          Laali is not a medical device. See a clinician for anything that worries you.
        </p>
      </Section>
    </AppShell>
  );
}
