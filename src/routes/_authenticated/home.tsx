import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, Section } from "@/components/AppShell";
import { CycleRing } from "@/components/CycleRing";
import { LogSheet } from "@/components/LogSheet";
import { Mascot, phaseMascot } from "@/components/Mascot";
import { IconPlus } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  PHASES,
  addDays,
  daysBetween,
  formatDay,
  fromISO,
  phaseFor,
  predict,
  toISO,
  today,
} from "@/lib/cycle";
import { useCycles, useLogs, useProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Today — Laali" },
      { name: "description", content: "Where you are in your cycle today, and a place to log it." },
      { property: "og:title", content: "Today — Laali" },
      { property: "og:description", content: "Your cycle at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const cycles = useCycles();
  const logs = useLogs();
  const [selected, setSelected] = useState(toISO(today()));
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (profile.data && profile.data.onboarded === false) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profile.data, navigate]);

  useEffect(() => {
    if (profile.data?.reduce_motion) document.documentElement.classList.add("calm-motion");
    else document.documentElement.classList.remove("calm-motion");
  }, [profile.data?.reduce_motion]);

  const rows = cycles.data ?? [];
  const opts = {
    avgCycleLength: profile.data?.avg_cycle_length ?? 28,
    lutealLength: profile.data?.luteal_length ?? 14,
  };
  const p = predict(rows, opts);
  const info = phaseFor(fromISO(selected), rows, opts);
  const todayInfo = phaseFor(today(), rows, opts);

  const strip = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today(), i - 5)),
    [],
  );

  const loggedDates = new Set((logs.data ?? []).map((l) => l.log_date));
  const selectedLog = (logs.data ?? []).find((l) => l.log_date === selected) ?? null;

  const loggedDaysOnRing = useMemo(() => {
    if (!p.lastStart) return [];
    return (logs.data ?? [])
      .map((l) => daysBetween(p.lastStart!, fromISO(l.log_date)) + 1)
      .filter((d) => d >= 1 && d <= p.cycleLength);
  }, [logs.data, p.lastStart, p.cycleLength]);

  const phase = info?.phase ?? null;
  const daysAway = p.nextStart ? daysBetween(today(), p.nextStart) : null;

  return (
    <AppShell variant="her">
      <Section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {today().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="mt-1 text-3xl">
          {profile.data?.display_name ? `Hello, ${profile.data.display_name}` : "Hello"}
        </h1>
      </Section>

      <div className="mt-5 flex justify-between gap-1.5">
        {strip.map((d) => {
          const iso = toISO(d);
          const isSelected = iso === selected;
          const dayPhase = phaseFor(d, rows, opts)?.phase;
          return (
            <button
              key={iso}
              onClick={() => setSelected(iso)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 transition-all",
                isSelected ? "border-foreground/60 bg-card" : "border-transparent bg-card/50",
              )}
            >
              <span className="text-[0.6rem] uppercase tracking-wide text-muted-foreground">
                {d.toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
              <span className="numeral text-base">{d.getDate()}</span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: loggedDates.has(iso)
                    ? dayPhase
                      ? PHASES[dayPhase].color
                      : "var(--ink)"
                    : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      <Section>
        {rows.length === 0 ? (
          <div className="paper flex flex-col items-center px-6 py-10 text-center">
            <Mascot state="distracted" size={130} bob />
            <h2 className="mt-4 text-xl">No cycle yet</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Log the first day of your last period and the ring will fill itself in.
            </p>
            <Button className="mt-5 rounded-full px-6" onClick={() => setSheetOpen(true)}>
              Log a day
            </Button>
          </div>
        ) : (
          <>
            <CycleRing
              cycleLength={p.cycleLength}
              lutealLength={p.lutealLength}
              dayOfCycle={todayInfo?.dayOfCycle ?? null}
              currentPhase={todayInfo?.phase ?? null}
              loggedDays={loggedDaysOnRing}
              confidence={p.confidence}
              caption={todayInfo ? `Day ${todayInfo.dayOfCycle}` : "Between cycles"}
              headline={daysAway != null && daysAway >= 0 ? `${daysAway}` : "—"}
              sub={
                daysAway != null && daysAway >= 0
                  ? `days until your period${p.variance ? ` · ±${Math.ceil(p.variance)}` : ""}`
                  : "log a period to see predictions"
              }
            />

            {todayInfo ? (
              <Link
                to="/learn"
                className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: PHASES[todayInfo.phase].color }}
                />
                {PHASES[todayInfo.phase].label} phase
              </Link>
            ) : null}
          </>
        )}
      </Section>

      <Section>
        <div
          className="paper flex items-center gap-4 p-5"
          style={{ background: phase ? PHASES[phase].soft : undefined }}
        >
          <Mascot state={phase ? phaseMascot[phase] : "neutral"} size={72} />
          <div>
            <p className="text-sm font-semibold">Today for you</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {phase
                ? PHASES[phase].blurb
                : "Add a period start date and Laali will start reading your pattern."}
            </p>
          </div>
        </div>
      </Section>

      {selectedLog ? (
        <Section title={formatDay(fromISO(selected))} hint="tap to edit">
          <button
            onClick={() => setSheetOpen(true)}
            className="paper w-full space-y-2 p-4 text-left"
          >
            {selectedLog.flow ? (
              <p className="text-sm capitalize">Flow: {selectedLog.flow}</p>
            ) : null}
            {selectedLog.moods.length ? (
              <p className="text-sm text-muted-foreground">{selectedLog.moods.join(" · ")}</p>
            ) : null}
            {selectedLog.symptoms.length ? (
              <p className="text-sm text-muted-foreground">{selectedLog.symptoms.join(" · ")}</p>
            ) : null}
            {selectedLog.note ? <p className="text-sm italic">"{selectedLog.note}"</p> : null}
          </button>
        </Section>
      ) : null}

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background shadow-lg"
      >
        <IconPlus className="h-4 w-4" />
        Log {selected === toISO(today()) ? "today" : formatDay(fromISO(selected))}
      </button>

      <LogSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={selected}
        existing={selectedLog}
        advanced={profile.data?.advanced_tracking ?? false}
      />
    </AppShell>
  );
}
