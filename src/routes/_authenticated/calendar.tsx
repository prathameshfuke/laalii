import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Section } from "@/components/AppShell";
import { LogSheet } from "@/components/LogSheet";
import { IconChevron } from "@/components/Icons";
import { PHASES, fromISO, phaseFor, predict, toISO, today } from "@/lib/cycle";
import { useCycles, useLogs, useProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar: Laali" },
      { name: "description", content: "Your months, coloured by phase, with every logged day." },
      { property: "og:title", content: "Calendar: Laali" },
      { property: "og:description", content: "Your cycle month by month." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const profile = useProfile();
  const cycles = useCycles();
  const logs = useLogs();
  const [cursor, setCursor] = useState(() => {
    const d = today();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const rows = cycles.data ?? [];
  const opts = {
    avgCycleLength: profile.data?.avg_cycle_length ?? 28,
    lutealLength: profile.data?.luteal_length ?? 14,
  };
  const p = predict(rows, opts);

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const logged = new Map((logs.data ?? []).map((l) => [l.log_date, l]));
  const todayISO = toISO(today());
  const selectedLog = selected ? (logged.get(selected) ?? null) : null;

  function shift(n: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  }

  return (
    <AppShell variant="her">
      <Section>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">
            {cursor.toLocaleDateString(undefined, { month: "long" })}{" "}
            <span className="numeral text-muted-foreground">{cursor.getFullYear()}</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => shift(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              aria-label="Previous month"
            >
              <IconChevron className="h-4 w-4 rotate-180" />
            </button>
            <button
              onClick={() => shift(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              aria-label="Next month"
            >
              <IconChevron className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Section>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toISO(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const info = phaseFor(d, rows, opts);
          const log = logged.get(iso);
          const future = d > today();
          return (
            <button
              key={iso}
              onClick={() => setSelected(iso)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition-all",
                !inMonth && "opacity-30",
                iso === todayISO && "ring-1 ring-foreground",
              )}
              style={{
                background: info
                  ? future
                    ? `color-mix(in oklab, ${PHASES[info.phase].color} 16%, var(--card))`
                    : PHASES[info.phase].soft
                  : "var(--card)",
                borderStyle: future ? "dashed" : "solid",
                borderWidth: 1,
                borderColor: future ? "var(--border)" : "transparent",
              }}
            >
              <span className="numeral">{d.getDate()}</span>
              {log?.flow ? (
                <span
                  className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--rose-deep)" }}
                />
              ) : log ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-foreground/40" />
              ) : null}
            </button>
          );
        })}
      </div>

      <Section title="Legend">
        <div className="paper flex flex-wrap gap-x-5 gap-y-2 p-4 text-sm">
          {(Object.keys(PHASES) as Array<keyof typeof PHASES>).map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: PHASES[k].color }}
              />
              {PHASES[k].label}
            </span>
          ))}
          <span className="text-muted-foreground">Dashed = predicted</span>
        </div>
      </Section>

      {p.confidence === "low" ? (
        <Section>
          <p className="text-sm text-muted-foreground">
            Predictions are still soft. A couple more logged cycles and these edges will firm up.
          </p>
        </Section>
      ) : null}

      <LogSheet
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        date={selected ?? todayISO}
        existing={selectedLog}
        advanced={profile.data?.advanced_tracking ?? false}
      />
    </AppShell>
  );
}
