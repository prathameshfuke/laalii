import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell, Section } from "@/components/AppShell";
import { Mascot } from "@/components/Mascot";
import {
  PHASES,
  cycleLengths,
  formatDay,
  fromISO,
  phaseFor,
  predict,
  sortedStarts,
} from "@/lib/cycle";
import { useCycles, useLogs, useProfile } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights: Laali" },
      { name: "description", content: "Cycle length trends, symptom patterns and what's coming up." },
      { property: "og:title", content: "Insights: Laali" },
      { property: "og:description", content: "Patterns Laali has noticed in your cycle." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InsightsPage,
});

const CONFIDENCE_COPY = {
  low: "Early days. Laali is still learning your rhythm.",
  medium: "Getting there. A couple more cycles will sharpen this.",
  high: "Your pattern is steady and predictions are firm.",
} as const;

function InsightsPage() {
  const profile = useProfile();
  const cycles = useCycles();
  const logs = useLogs();

  const rows = cycles.data ?? [];
  const opts = {
    avgCycleLength: profile.data?.avg_cycle_length ?? 28,
    lutealLength: profile.data?.luteal_length ?? 14,
  };
  const p = predict(rows, opts);
  const lengths = cycleLengths(rows);
  const starts = sortedStarts(rows);

  const symptomByPhase = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const log of logs.data ?? []) {
      const info = phaseFor(fromISO(log.log_date), rows, opts);
      if (!info) continue;
      map[info.phase] ??= {};
      for (const s of [...log.symptoms, ...log.moods]) {
        map[info.phase]![s] = (map[info.phase]![s] ?? 0) + 1;
      }
    }
    return map;
  }, [logs.data, rows, opts.avgCycleLength, opts.lutealLength]);

  const max = lengths.length ? Math.max(...lengths) : 30;
  const min = lengths.length ? Math.min(...lengths) : 26;

  return (
    <AppShell variant="her">
      <Section>
        <h1 className="text-3xl">Insights</h1>
        <p className="mt-2 text-sm text-muted-foreground">{CONFIDENCE_COPY[p.confidence]}</p>
      </Section>

      <Section>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Avg cycle", value: `${Math.round(p.cycleLength)}`, unit: "days" },
            {
              label: "Variation",
              value: p.variance ? `±${p.variance}` : "n/a",
              unit: "days",
            },
            { label: "Cycles logged", value: `${p.observedCycles + (starts.length ? 1 : 0)}`, unit: "total" },
          ].map((s) => (
            <div key={s.label} className="paper p-4 text-center">
              <p className="numeral text-2xl">{s.value}</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="text-[0.65rem] text-muted-foreground">{s.unit}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cycle length over time">
        {lengths.length < 2 ? (
          <div className="paper flex items-center gap-4 p-5">
            <Mascot state="distracted" size={64} />
            <p className="text-sm text-muted-foreground">
              Log two full cycles and this chart will start drawing itself.
            </p>
          </div>
        ) : (
          <div className="paper p-5">
            <div className="flex h-36 items-end gap-2">
              {lengths.map((l, i) => {
                const span = Math.max(1, max - min);
                const h = 25 + ((l - min) / span) * 70;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="numeral text-[0.65rem] text-muted-foreground">{l}</span>
                    <div
                      className="w-full rounded-t-lg"
                      style={{ height: `${h}%`, background: "var(--rose)" }}
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Each bar is one completed cycle, oldest on the left.
            </p>
          </div>
        )}
      </Section>

      <Section title="What tends to show up when">
        {Object.keys(symptomByPhase).length === 0 ? (
          <div className="paper p-5 text-sm text-muted-foreground">
            Once you've logged symptoms and moods for a while, Laali will group them by phase here.
          </div>
        ) : (
          <div className="space-y-3">
            {(Object.keys(PHASES) as Array<keyof typeof PHASES>).map((phase) => {
              const entries = Object.entries(symptomByPhase[phase] ?? {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4);
              if (!entries.length) return null;
              return (
                <div
                  key={phase}
                  className="paper p-4"
                  style={{ background: PHASES[phase].soft }}
                >
                  <p className="text-sm font-semibold">{PHASES[phase].label}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {entries.map(([name, count]) => (
                      <span
                        key={name}
                        className="rounded-full bg-card/80 px-3 py-1 text-xs"
                      >
                        {name} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <IntimacySection rows={rows} opts={opts} />



      <Section title="Coming up">
        <div className="paper space-y-3 p-5 text-sm">
          {p.nextStart ? (
            <Row label="Next period" value={formatDay(p.nextStart)} />
          ) : null}
          {p.ovulation ? <Row label="Estimated ovulation" value={formatDay(p.ovulation)} /> : null}
          {p.fertileFrom && p.fertileTo ? (
            <Row
              label="Fertile window"
              value={`${formatDay(p.fertileFrom)} – ${formatDay(p.fertileTo)}`}
            />
          ) : null}
          {!p.nextStart ? (
            <p className="text-muted-foreground">Log a period start to see what's ahead.</p>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Laali's estimates are informational and not contraception or medical advice.
        </p>
      </Section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
