import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell, Section } from "@/components/AppShell";
import { Mascot } from "@/components/Mascot";
import {
  INTIMACY_FLAGS,
  PHASES,
  cycleLengths,
  daysBetween,
  formatDay,
  fromISO,
  phaseFor,
  predict,
  sortedStarts,
  today,
  type CycleRow,
} from "@/lib/cycle";
import { useCycles, useIntimacyLogs, useLogs, useProfile } from "@/lib/data";

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
            {
              label: "Avg cycle",
              value: p.observedCycles ? `${Math.round(p.cycleLength)}` : "n/a",
              unit: p.observedCycles ? "days" : "not enough yet",
            },
            {
              label: "Variation",
              value: p.observedCycles >= 2 && p.variance ? `±${p.variance}` : "n/a",
              unit: p.observedCycles >= 2 ? "days" : "not enough yet",
            },
            {
              label: "Cycles logged",
              value: `${starts.length}`,
              unit: "total",
            },
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

function IntimacySection({
  rows,
  opts,
}: {
  rows: CycleRow[];
  opts: { avgCycleLength: number; lutealLength: number };
}) {
  const profile = useProfile();
  const intimacy = useIntimacyLogs();
  const entries = intimacy.data ?? [];
  const intent = profile.data?.intent ?? "tracking";

  const desireByPhase = useMemo(() => {
    const acc: Record<string, { sum: number; n: number }> = {};
    for (const e of entries) {
      if (e.desire == null) continue;
      const info = phaseFor(fromISO(e.log_date), rows, opts);
      if (!info) continue;
      acc[info.phase] ??= { sum: 0, n: 0 };
      acc[info.phase]!.sum += e.desire;
      acc[info.phase]!.n += 1;
    }
    return acc;
  }, [entries, rows, opts.avgCycleLength, opts.lutealLength]);

  const flags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) {
      for (const s of e.symptoms) {
        if ((INTIMACY_FLAGS as readonly string[]).includes(s)) counts[s] = (counts[s] ?? 0) + 1;
      }
    }
    return Object.entries(counts).filter(([, n]) => n >= 2);
  }, [entries]);

  const lastEntry = entries[0]?.log_date;
  const daysSince = lastEntry ? daysBetween(fromISO(lastEntry), today()) : null;

  return (
    <Section title="Intimacy" hint="private to you">
      <div className="space-y-3">
        <div className="paper p-5">
          <p className="text-sm font-semibold">Desire across the month</p>
          {Object.keys(desireByPhase).length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Log desire a few times and Laali will show how it moves with your phases.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {(Object.keys(PHASES) as Array<keyof typeof PHASES>).map((phase) => {
                const d = desireByPhase[phase];
                if (!d) return null;
                const avg = d.sum / d.n;
                return (
                  <div key={phase} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-muted-foreground">{PHASES[phase].label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(avg / 5) * 100}%`, background: "var(--rose)" }}
                      />
                    </div>
                    <span className="numeral w-8 text-right text-xs">{avg.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="paper p-5">
          <p className="text-sm font-semibold">
            {intent === "conceive"
              ? "Your fertile window"
              : intent === "avoid"
                ? "Days with a higher chance of pregnancy"
                : "Fertile window"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {intent === "conceive"
              ? "Unprotected days you log inside the fertile window are counted here so you can see your timing at a glance."
              : intent === "avoid"
                ? "Laali is not contraception. Treat the fertile window as a caution, not a rule, and use protection you trust."
                : "Switch your goal in Settings and Laali will frame this window for trying to conceive or for avoiding pregnancy."}
          </p>
        </div>

        {flags.length ? (
          <div className="paper p-5">
            <p className="text-sm font-semibold">Worth mentioning to a clinician</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {flags.map(([name, n]) => (
                <li key={name}>
                  {name}, logged {n} times.
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              This is a pattern, not a diagnosis. It is worth raising, that is all.
            </p>
          </div>
        ) : null}

        <div className="paper p-5 text-sm text-muted-foreground">
          {daysSince == null
            ? "Nothing logged here yet. It is entirely optional."
            : `Last intimacy entry: ${daysSince === 0 ? "today" : `${daysSince} days ago`}.`}
          <span className="mt-2 block text-xs">
            None of this is ever visible in Couples Mode.
          </span>
        </div>
      </div>
    </Section>
  );
}
