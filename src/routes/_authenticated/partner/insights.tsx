import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Section } from "@/components/AppShell";
import { CardDeck } from "@/components/CardDeck";
import { Mascot, phaseMascot } from "@/components/Mascot";
import { PHASES, phaseFor, predict, today } from "@/lib/cycle";
import {
  careNoteFor,
  currentCycleSymptoms,
  discomfortByPhase,
  headsUp,
  phaseLabel,
  regularitySummary,
} from "@/lib/insights";
import { PARTNER_TOPICS, phaseCards } from "@/lib/learn-content";
import { useCycles, useLinksToMe, useOwnerProfile, usePartnerLogs } from "@/lib/data";
import { toISO } from "@/lib/cycle";

export const Route = createFileRoute("/_authenticated/partner/insights")({
  head: () => ({
    meta: [
      { title: "Insights: Laali" },
      {
        name: "description",
        content: "Patterns she has chosen to share, plus plain-language sexual health basics.",
      },
      { property: "og:title", content: "Insights: Laali" },
      { property: "og:description", content: "Understand the pattern, not just today." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerInsights,
});

function PartnerInsights() {
  const links = useLinksToMe();
  const link = (links.data ?? [])[0] ?? null;
  const owner = useOwnerProfile(link?.owner_id);
  const cycles = useCycles(link?.owner_id);
  const logs = usePartnerLogs(link?.owner_id, !!link?.share_symptoms || !!link?.share_mood);

  const opts = {
    avgCycleLength: owner.data?.avg_cycle_length ?? 28,
    lutealLength: owner.data?.luteal_length ?? 14,
  };
  const rows = cycles.data ?? [];
  const sharedLogs = link?.share_symptoms ? (logs.data ?? []) : [];
  const p = predict(rows, opts);
  const info = phaseFor(today(), rows, opts);
  const her = owner.data?.display_name ?? "She";

  const regularity = link?.share_phase ? regularitySummary(rows) : null;
  const discomfort = discomfortByPhase(sharedLogs, rows, opts);
  const thisCycle = currentCycleSymptoms(sharedLogs, rows).slice(0, 4);
  const ahead = headsUp(sharedLogs, rows);
  const care = careNoteFor(info?.phase ?? null, p.lastStart ? toISO(p.lastStart) : "none");

  const hasPatterns = !!(regularity || discomfort || thisCycle.length || ahead);

  return (
    <AppShell variant="his">
      <Section>
        <h1 className="text-3xl">Insights</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Patterns first, then the general stuff worth knowing. Nothing here is a diagnosis.
        </p>
      </Section>

      {!link ? (
        <Section>
          <div className="paper p-5 text-sm text-muted-foreground">
            Once you are connected, her shared patterns will show up here. The learning cards below
            work either way.
          </div>
        </Section>
      ) : null}

      {link && hasPatterns ? (
        <Section title={`Her pattern, so far`}>
          <div className="space-y-3">
            {regularity ? (
              <div className="paper p-5">
                <p className="text-sm">{regularity.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  From {regularity.cyclesSeen} completed cycles.
                </p>
              </div>
            ) : null}

            {discomfort ? (
              <div className="paper p-5" style={{ background: PHASES[discomfort.phase].soft }}>
                <p className="text-sm">
                  Most of the discomfort she logs lands in the {phaseLabel(discomfort.phase)} phase.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  That is where a bit of extra slack tends to matter most.
                </p>
              </div>
            ) : null}

            {thisCycle.length ? (
              <div className="paper p-5">
                <p className="text-sm font-semibold">This cycle so far</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {thisCycle.map(([name, count]) => (
                    <span key={name} className="rounded-full bg-background/70 px-3 py-1 text-xs">
                      {name} · {count}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {ahead ? (
              <div className="paper p-5">
                <p className="text-sm font-semibold">Heads up</p>
                <p className="mt-1 text-sm text-muted-foreground">{ahead.text}</p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : link ? (
        <Section title="Her pattern, so far">
          <div className="paper p-5 text-sm text-muted-foreground">
            Not enough shared history yet. As she logs, and depending on what she has chosen to
            share, patterns will appear here.
          </div>
        </Section>
      ) : null}

      {link && info && link.share_phase && care ? (
        <Section title="One thing that helps this week">
          <div
            className="paper flex items-center gap-4 p-5"
            style={{ background: PHASES[info.phase].soft }}
          >
            <Mascot state={phaseMascot[info.phase]} size={64} />
            <p className="text-sm">{care.forPartner}</p>
          </div>
        </Section>
      ) : null}

      <Section title="Understanding the cycle" hint="swipe">
        <CardDeck cards={phaseCards(link?.share_phase ? (info?.phase ?? null) : null)} />
      </Section>

      {PARTNER_TOPICS.filter((t) => t.id !== "cycle").map((topic) => (
        <Section key={topic.id} title={topic.title} hint="swipe">
          <p className="mb-3 text-sm text-muted-foreground">{topic.blurb}</p>
          <CardDeck cards={topic.cards} />
        </Section>
      ))}

      <Section>
        <p className="text-xs text-muted-foreground">
          {her} controls what you can see, and can change it at any time. Laali is not a medical
          device.
        </p>
      </Section>
    </AppShell>
  );
}
