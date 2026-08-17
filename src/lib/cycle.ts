export type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

export const PHASES: Record<
  Phase,
  { label: string; color: string; soft: string; blurb: string }
> = {
  menstrual: {
    label: "Menstrual",
    color: "var(--rose)",
    soft: "color-mix(in oklab, var(--rose) 18%, transparent)",
    blurb: "Bleeding days. Energy usually runs low and rest goes a long way.",
  },
  follicular: {
    label: "Follicular",
    color: "var(--apricot)",
    soft: "color-mix(in oklab, var(--apricot) 24%, transparent)",
    blurb: "Rebuilding days. Energy and appetite for new things tend to climb.",
  },
  ovulation: {
    label: "Ovulation",
    color: "var(--marigold)",
    soft: "color-mix(in oklab, var(--marigold) 20%, transparent)",
    blurb: "The fertile window. Often the most outward-facing stretch of the cycle.",
  },
  luteal: {
    label: "Luteal",
    color: "var(--mauve)",
    soft: "color-mix(in oklab, var(--mauve) 20%, transparent)",
    blurb: "Winding down. Cramps, cravings and tenderness are common here.",
  },
};

export const FLOW_LEVELS = ["spotting", "light", "medium", "heavy"] as const;
export type FlowLevel = (typeof FLOW_LEVELS)[number];

export const SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Backache",
  "Tender breasts",
  "Acne",
  "Nausea",
  "Cravings",
  "Insomnia",
  "Low energy",
];

export const MOODS = [
  "Calm",
  "Happy",
  "Energetic",
  "Sensitive",
  "Irritable",
  "Anxious",
  "Tearful",
  "Foggy",
  "Affectionate",
  "Withdrawn",
];

/* ---------- date helpers (all local, date-only) ---------- */

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function daysBetween(a: Date, b: Date): number {
  const ms =
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() -
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  return Math.round(ms / 86400000);
}

export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/* ---------- statistics ---------- */

export interface CycleRow {
  id: string;
  period_start: string;
  period_end: string | null;
}

export function sortedStarts(cycles: CycleRow[]): Date[] {
  return cycles
    .map((c) => fromISO(c.period_start))
    .sort((a, b) => a.getTime() - b.getTime());
}

export function cycleLengths(cycles: CycleRow[]): number[] {
  const starts = sortedStarts(cycles);
  const out: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const len = daysBetween(starts[i - 1]!, starts[i]!);
    if (len >= 15 && len <= 60) out.push(len);
  }
  return out;
}

/** Recency-weighted mean over the last 3-6 cycle lengths. */
export function weightedCycleLength(cycles: CycleRow[], fallback = 28): number {
  const lengths = cycleLengths(cycles).slice(-6);
  if (lengths.length === 0) return fallback;
  let num = 0;
  let den = 0;
  lengths.forEach((len, i) => {
    const w = i + 1; // most recent weighs most
    num += len * w;
    den += w;
  });
  return Math.round(num / den);
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export interface Prediction {
  lastStart: Date | null;
  cycleLength: number;
  lutealLength: number;
  nextStart: Date | null;
  ovulation: Date | null;
  fertileFrom: Date | null;
  fertileTo: Date | null;
  variance: number;
  confidence: "low" | "medium" | "high";
  observedCycles: number;
}

export function predict(
  cycles: CycleRow[],
  opts: { avgCycleLength?: number; lutealLength?: number } = {},
): Prediction {
  const starts = sortedStarts(cycles);
  const lengths = cycleLengths(cycles);
  const lastStart = starts.length ? starts[starts.length - 1]! : null;
  const cycleLength = starts.length > 1
    ? weightedCycleLength(cycles, opts.avgCycleLength ?? 28)
    : (opts.avgCycleLength ?? 28);
  const lutealLength = opts.lutealLength ?? 14;
  const variance = Math.min(7, Math.round(stdDev(lengths) * 10) / 10);

  const nextStart = lastStart ? addDays(lastStart, cycleLength) : null;
  const ovulation = nextStart ? addDays(nextStart, -lutealLength) : null;
  const fertileFrom = ovulation ? addDays(ovulation, -5) : null;
  const fertileTo = ovulation ? addDays(ovulation, 1) : null;

  const confidence: Prediction["confidence"] =
    lengths.length >= 3 && variance <= 2
      ? "high"
      : lengths.length >= 2 && variance <= 4
        ? "medium"
        : "low";

  return {
    lastStart,
    cycleLength,
    lutealLength,
    nextStart,
    ovulation,
    fertileFrom,
    fertileTo,
    variance,
    confidence,
    observedCycles: lengths.length,
  };
}

export interface PhaseInfo {
  phase: Phase;
  dayOfCycle: number;
  cycleLength: number;
  daysToNextPeriod: number | null;
}

/** Which phase a given date falls in, based on the most recent period start before it. */
export function phaseFor(
  date: Date,
  cycles: CycleRow[],
  opts: { avgCycleLength?: number; lutealLength?: number; periodLength?: number } = {},
): PhaseInfo | null {
  const starts = sortedStarts(cycles);
  if (!starts.length) return null;

  const prior = [...starts].reverse().find((s) => daysBetween(s, date) >= 0);
  if (!prior) return null;

  const p = predict(cycles, opts);
  const cycleLength = p.cycleLength;
  const dayOfCycle = daysBetween(prior, date) + 1;
  if (dayOfCycle > cycleLength + 21) return null;

  const periodLength = opts.periodLength ?? periodLengthOf(cycles, prior) ?? 5;
  const ovulationDay = cycleLength - p.lutealLength;

  let phase: Phase;
  if (dayOfCycle <= periodLength) phase = "menstrual";
  else if (dayOfCycle < ovulationDay - 1) phase = "follicular";
  else if (dayOfCycle <= ovulationDay + 1) phase = "ovulation";
  else phase = "luteal";

  const nextStart = addDays(prior, cycleLength);
  return {
    phase,
    dayOfCycle,
    cycleLength,
    daysToNextPeriod: daysBetween(date, nextStart),
  };
}

function periodLengthOf(cycles: CycleRow[], start: Date): number | null {
  const row = cycles.find((c) => c.period_start === toISO(start));
  if (!row?.period_end) return null;
  return daysBetween(fromISO(row.period_start), fromISO(row.period_end)) + 1;
}

export function phaseSegments(cycleLength: number, lutealLength: number, periodLength = 5) {
  const ovulationDay = cycleLength - lutealLength;
  return [
    { phase: "menstrual" as Phase, from: 1, to: periodLength },
    { phase: "follicular" as Phase, from: periodLength + 1, to: ovulationDay - 2 },
    { phase: "ovulation" as Phase, from: ovulationDay - 1, to: ovulationDay + 1 },
    { phase: "luteal" as Phase, from: ovulationDay + 2, to: cycleLength },
  ].filter((s) => s.to >= s.from);
}
