/**
 * Derived insights. Every function here reads real logged rows and returns
 * null when there is not enough history to say something honest.
 */
import {
  PHASES,
  addDays,
  cycleLengths,
  daysBetween,
  fromISO,
  phaseFor,
  sortedStarts,
  stdDev,
  today,
  type CycleRow,
  type Phase,
} from "@/lib/cycle";

export interface SeverityMap {
  [symptom: string]: number; // 1 mild, 2 moderate, 3 strong
}

export interface LogLike {
  log_date: string;
  symptoms: string[];
  moods: string[];
  symptom_severity?: SeverityMap | null;
}

export const SEVERITY_LABELS = ["Mild", "Moderate", "Strong"] as const;

/** Symptoms and moods that people commonly mean when they say PMS. */
export const PMS_MARKERS = [
  "Cramps",
  "Bloating",
  "Tender breasts",
  "Headache",
  "Cravings",
  "Low energy",
  "Irritable",
  "Tearful",
  "Anxious",
  "Sensitive",
];

function isPms(log: LogLike) {
  return [...log.symptoms, ...log.moods].some((s) => PMS_MARKERS.includes(s));
}

export interface PmsWindow {
  /** How many days before the period symptoms have typically started. */
  typicalLead: number;
  spread: number;
  cyclesSeen: number;
  from: Date | null;
  to: Date | null;
}

/**
 * Looks back at how many days before each past period the first PMS type
 * entry appeared. Needs at least two past periods with logs before them.
 */
export function pmsWindow(
  logs: LogLike[],
  cycles: CycleRow[],
  nextStart: Date | null,
): PmsWindow | null {
  const starts = sortedStarts(cycles);
  if (starts.length < 2) return null;

  const leads: number[] = [];
  for (const start of starts) {
    let earliest: number | null = null;
    for (const log of logs) {
      if (!isPms(log)) continue;
      const lead = daysBetween(fromISO(log.log_date), start);
      if (lead >= 1 && lead <= 10) earliest = Math.max(earliest ?? 0, lead);
    }
    if (earliest != null) leads.push(earliest);
  }
  if (leads.length < 2) return null;

  const typicalLead = Math.round(leads.reduce((a, b) => a + b, 0) / leads.length);
  const spread = Math.max(1, Math.round(stdDev(leads)));
  return {
    typicalLead,
    spread,
    cyclesSeen: leads.length,
    from: nextStart ? addDays(nextStart, -(typicalLead + spread)) : null,
    to: nextStart ? addDays(nextStart, -Math.max(1, typicalLead - spread)) : null,
  };
}

export interface SeverityTrend {
  symptom: string;
  direction: "easier" | "steadier" | "harder";
  recent: number;
  earlier: number;
  cyclesSeen: number;
}

/** Average severity per cycle for each symptom she rates, oldest cycle first. */
export function severityByCycle(logs: LogLike[], cycles: CycleRow[]) {
  const starts = sortedStarts(cycles);
  if (!starts.length) return {} as Record<string, number[]>;

  const buckets: Record<string, Array<{ sum: number; n: number }>> = {};
  for (const log of logs) {
    const sev = log.symptom_severity ?? {};
    const entries = Object.entries(sev).filter(([, v]) => typeof v === "number" && v > 0);
    if (!entries.length) continue;
    const date = fromISO(log.log_date);
    let index = -1;
    starts.forEach((s, i) => {
      if (daysBetween(s, date) >= 0) index = i;
    });
    if (index < 0) continue;
    for (const [name, value] of entries) {
      buckets[name] ??= starts.map(() => ({ sum: 0, n: 0 }));
      buckets[name]![index]!.sum += value as number;
      buckets[name]![index]!.n += 1;
    }
  }

  const out: Record<string, number[]> = {};
  for (const [name, cyclesOfIt] of Object.entries(buckets)) {
    const averages = cyclesOfIt.map((c) => (c.n ? c.sum / c.n : NaN));
    out[name] = averages;
  }
  return out;
}

/** The clearest severity story across the last few cycles, if there is one. */
export function severityTrends(logs: LogLike[], cycles: CycleRow[]): SeverityTrend[] {
  const byCycle = severityByCycle(logs, cycles);
  const trends: SeverityTrend[] = [];

  for (const [symptom, averages] of Object.entries(byCycle)) {
    const seen = averages
      .map((v, i) => ({ v, i }))
      .filter((x) => !Number.isNaN(x.v))
      .slice(-6);
    if (seen.length < 3) continue;
    const half = Math.floor(seen.length / 2);
    const earlierSet = seen.slice(0, half);
    const recentSet = seen.slice(seen.length - half);
    const earlier = earlierSet.reduce((a, b) => a + b.v, 0) / earlierSet.length;
    const recent = recentSet.reduce((a, b) => a + b.v, 0) / recentSet.length;
    const delta = recent - earlier;
    trends.push({
      symptom,
      direction: delta >= 0.35 ? "harder" : delta <= -0.35 ? "easier" : "steadier",
      recent,
      earlier,
      cyclesSeen: seen.length,
    });
  }

  return trends.sort((a, b) => b.cyclesSeen - a.cyclesSeen).slice(0, 3);
}

/* ---------- self care notes ---------- */

export interface CareNote {
  id: string;
  phase: Phase;
  text: string;
  /** A version of the same idea written for a partner. */
  forPartner: string;
}

export const CARE_NOTES: CareNote[] = [
  {
    id: "menstrual-warmth",
    phase: "menstrual",
    text: "Warmth on your lower back or belly for twenty minutes can take the edge off cramps.",
    forPartner: "A heating pad or hot water bottle on her lower back tends to help with cramps.",
  },
  {
    id: "menstrual-iron",
    phase: "menstrual",
    text: "Iron friendly food helps these days: lentils, greens, eggs, a little dark chocolate.",
    forPartner: "Cook something iron friendly, lentils or greens, and keep the evening low key.",
  },
  {
    id: "follicular-move",
    phase: "follicular",
    text: "Energy usually climbs now. A longer walk or a harder session often feels good.",
    forPartner: "Energy usually climbs this week. Suggest a walk or something active together.",
  },
  {
    id: "follicular-start",
    phase: "follicular",
    text: "A good stretch for starting the thing you have been putting off.",
    forPartner: "Good week for plans and new things. Say yes to the spontaneous idea.",
  },
  {
    id: "ovulation-water",
    phase: "ovulation",
    text: "Keep water nearby. Appetite and energy peak here and both run on hydration.",
    forPartner: "Energy and confidence usually peak here. Good time for the bigger conversations.",
  },
  {
    id: "luteal-sleep",
    phase: "luteal",
    text: "Sleep gets lighter in the back half. An earlier night pays off more than usual.",
    forPartner: "Sleep gets lighter for her now. Protect an early night where you can.",
  },
  {
    id: "luteal-steady",
    phase: "luteal",
    text: "Steady meals and less caffeine tend to soften the landing into your period.",
    forPartner: "Steady meals and fewer last minute changes help in the days before her period.",
  },
];

/** One note for the phase, stable for a given cycle so it does not shuffle. */
export function careNoteFor(phase: Phase | null, cycleKey: string): CareNote | null {
  if (!phase) return null;
  const pool = CARE_NOTES.filter((n) => n.phase === phase);
  if (!pool.length) return null;
  let hash = 0;
  for (const ch of cycleKey) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  return pool[hash % pool.length]!;
}

/* ---------- partner side patterns ---------- */

export interface RegularitySummary {
  text: string;
  cyclesSeen: number;
}

export function regularitySummary(cycles: CycleRow[]): RegularitySummary | null {
  const lengths = cycleLengths(cycles);
  if (lengths.length < 3) return null;
  const spread = stdDev(lengths);
  const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const text =
    spread <= 2
      ? `Her cycles have been fairly regular over the last ${lengths.length} months, around ${avg} days each.`
      : spread <= 4
        ? `Her cycles have varied a little lately, roughly ${avg} days give or take a few.`
        : `Her cycles have been quite variable lately, from ${Math.min(...lengths)} to ${Math.max(...lengths)} days.`;
  return { text, cyclesSeen: lengths.length };
}

export function discomfortByPhase(
  logs: LogLike[],
  cycles: CycleRow[],
  opts: { avgCycleLength?: number; lutealLength?: number },
): { phase: Phase; count: number; total: number } | null {
  const counts: Partial<Record<Phase, number>> = {};
  let total = 0;
  for (const log of logs) {
    if (!log.symptoms.length) continue;
    const info = phaseFor(fromISO(log.log_date), cycles, opts);
    if (!info) continue;
    counts[info.phase] = (counts[info.phase] ?? 0) + log.symptoms.length;
    total += log.symptoms.length;
  }
  if (total < 6) return null;
  const top = (Object.entries(counts) as Array<[Phase, number]>).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] / total < 0.4) return null;
  return { phase: top[0], count: top[1], total };
}

export function phaseLabel(phase: Phase) {
  return PHASES[phase].label.toLowerCase();
}

/** Symptoms logged in the current cycle, most frequent first. */
export function currentCycleSymptoms(logs: LogLike[], cycles: CycleRow[]) {
  const starts = sortedStarts(cycles);
  const last = starts[starts.length - 1];
  if (!last) return [] as Array<[string, number]>;
  const counts: Record<string, number> = {};
  for (const log of logs) {
    const d = fromISO(log.log_date);
    if (daysBetween(last, d) < 0 || daysBetween(d, today()) < 0) continue;
    for (const s of log.symptoms) counts[s] = (counts[s] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export interface HeadsUp {
  text: string;
}

/**
 * Compares symptom load so far this cycle against the same stretch of
 * earlier cycles. Needs at least two earlier cycles to compare against.
 */
export function headsUp(logs: LogLike[], cycles: CycleRow[]): HeadsUp | null {
  const starts = sortedStarts(cycles);
  if (starts.length < 3) return null;
  const last = starts[starts.length - 1]!;
  const dayOfCycle = daysBetween(last, today()) + 1;
  if (dayOfCycle < 4) return null;

  const load = (from: Date, days: number) => {
    let n = 0;
    for (const log of logs) {
      const offset = daysBetween(from, fromISO(log.log_date));
      if (offset >= 0 && offset < days) n += log.symptoms.length;
    }
    return n;
  };

  const current = load(last, dayOfCycle);
  const previous = starts.slice(0, -1).slice(-3).map((s) => load(s, dayOfCycle));
  if (!previous.length) return null;
  const avg = previous.reduce((a, b) => a + b, 0) / previous.length;
  if (avg < 2) return null;

  if (current >= avg * 1.5) {
    return {
      text: "She has logged more discomfort so far this cycle than she usually does by this point. Nothing alarming, just worth a little extra patience.",
    };
  }
  if (current <= avg * 0.5) {
    return { text: "This cycle has been an easier one for her so far, compared with her usual pattern." };
  }
  return null;
}
