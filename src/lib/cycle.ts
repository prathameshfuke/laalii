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

/* ---------- Over 200 categorized experiences (physical & emotional) ---------- */
export const EXPERIENCE_CATEGORIES = [
  {
    id: "pain",
    label: "Pain & Cramps",
    items: [
      "Cramps",
      "Lower back pain",
      "Pelvic pressure",
      "Headache",
      "Migraine",
      "Breast tenderness",
      "Joint stiffness",
      "Muscle soreness",
      "Ovulation pain (mittelschmerz)",
      "Vulvar soreness",
      "Hip pain",
      "Neck tension",
      "Tailbone pain",
      "Leg aches",
      "Sharp twinges",
      "Dull ache",
      "Radiating thigh pain",
      "Burning sensation",
      "Chest soreness",
      "Sciatic pain",
      "Groin strain",
      "Foot swelling pain",
      "Abdominal spasms",
      "Jaw clenching",
      "Body aches",
    ],
  },
  {
    id: "mood",
    label: "Mood & Mind",
    items: [
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
      "Overwhelmed",
      "Depressed",
      "Mood swings",
      "Restless",
      "Confident",
      "Creative",
      "Unmotivated",
      "Stressed",
      "Easily angered",
      "Melancholic",
      "Grateful",
      "Patient",
      "Hyper-focused",
      "Social",
      "Anti-social",
      "Euphoric",
      "Emotionally numb",
      "Insecure",
      "Inspired",
      "Hopeful",
      "Frustrated",
      "Weepy",
      "Excitable",
      "Content",
      "Vulnerable",
    ],
  },
  {
    id: "sleep",
    label: "Sleep & Dreams",
    items: [
      "Deep sleep",
      "Insomnia",
      "Disrupted sleep",
      "Vivid dreams",
      "Nightmares",
      "Night sweats",
      "Difficulty waking",
      "Daytime sleepiness",
      "Frequent waking",
      "Snoring",
      "Waking unrefreshed",
      "Restless legs",
      "Afternoon crash",
      "Short sleep (<6h)",
      "Long sleep (>9h)",
      "Hypnagogic jerks",
      "Sleep paralysis",
      "Tossing & turning",
      "Light sleeper",
      "Nap taken",
    ],
  },
  {
    id: "skin",
    label: "Skin & Hair",
    items: [
      "Acne",
      "Cystic breakout",
      "Chin pimples",
      "Forehead pimples",
      "Oily skin",
      "Dry skin",
      "Glowing skin",
      "Flushed cheeks",
      "Sensitive skin",
      "Eczema flare",
      "Hives / allergic rash",
      "Hair thinning",
      "Greasy hair",
      "Lustrous hair",
      "Itchy scalp",
      "Dandruff flare",
      "Brittle nails",
      "Ingrown hairs",
      "Dark eye circles",
      "Puffy face",
    ],
  },
  {
    id: "energy",
    label: "Energy & Vitality",
    items: [
      "Low energy",
      "Peak stamina",
      "Burst of energy",
      "Steady vitality",
      "Mild fatigue",
      "Heavy exhaustion",
      "Bedridden fatigue",
      "Workout high",
      "Post-exercise soreness",
      "Low physical endurance",
      "High endurance",
      "Fast recovery",
      "Sluggishness",
      "Brain alertness",
      "Lethargy",
      "Motivation surge",
      "Heavy limbs",
      "Drained",
      "Refreshed",
      "Productive flow",
    ],
  },
  {
    id: "digestion",
    label: "Digestion & Gut",
    items: [
      "Bloating",
      "Abdominal distension",
      "Constipation",
      "Diarrhea",
      "Nausea",
      "Morning sickness",
      "Acid reflux",
      "Heartburn",
      "Excessive gas",
      "Indigestion",
      "Stomach cramps",
      "Gurgling gut",
      "IBS flare",
      "Food sensitivity",
      "High thirst",
      "Loss of appetite",
      "Slow digestion",
      "Rapid digestion",
      "Dry mouth",
      "Burping",
      "Metallic taste",
      "Dehydration",
      "Water retention",
      "Stomach heaviness",
      "Frequent bowel movements",
    ],
  },
  {
    id: "cravings",
    label: "Cravings & Food",
    items: [
      "Cravings",
      "Chocolate cravings",
      "Salt cravings",
      "Sugar cravings",
      "Carb cravings",
      "Dairy / cheese cravings",
      "Meat cravings",
      "Spicy cravings",
      "Sour cravings",
      "Binge urge",
      "Balanced appetite",
      "Food aversion",
      "Coffee craving",
      "Caffeine sensitivity",
      "Comfort food",
      "Healthy food craving",
      "Late-night hunger",
      "Unquenchable thirst",
      "Fast satiety",
      "Constant snacking",
    ],
  },
  {
    id: "cervical",
    label: "Cervical Fluid",
    items: [
      "Dry / None",
      "Sticky mucus",
      "Creamy lotion-like",
      "Egg white (fertile)",
      "Watery fluid",
      "Thick white",
      "Light spotting",
      "Brown discharge",
      "Pink discharge",
      "Clotted flow",
      "Yeast symptoms",
      "Odor change",
      "pH sensitivity",
      "High lubrication",
      "Vulvar dryness",
    ],
  },
  {
    id: "contraception",
    label: "Birth Control & Meds",
    items: [
      "Pill taken on time",
      "Pill taken late",
      "Missed pill",
      "Patch changed",
      "Ring inserted",
      "Ring removed",
      "IUD check string felt",
      "Breakthrough bleeding",
      "Hormone headache",
      "Contraception nausea",
      "Pill withdrawal bleed",
      "Painkillers taken",
      "Supplements taken",
      "Antibiotics taken",
      "Antihistamines taken",
    ],
  },
  {
    id: "pregnancy",
    label: "Pregnancy & Milestones",
    items: [
      "Positive test",
      "Negative test",
      "Faint line test",
      "Baby kicks felt",
      "Nipple darkening",
      "Braxton Hicks",
      "Round ligament twinge",
      "Frequent urination",
      "Heightened smell",
      "Colostrum drop",
      "Swollen feet/ankles",
      "Pelvic girdle loosening",
      "Postpartum bleeding",
      "Breast engorgement",
      "Lactation active",
    ],
  },
  {
    id: "perimenopause",
    label: "Perimenopause",
    items: [
      "Hot flash",
      "Sudden flushing",
      "Night drenching sweat",
      "Skipped period",
      "Irregular long cycle",
      "Irregular short cycle",
      "Vaginal dryness",
      "Heart palpitations",
      "Memory lapse",
      "Chills after flash",
      "Joint stiffness flare",
      "Unexplained anxiety",
      "Weight fluctuation",
      "Sleep awakening at 3am",
      "Mood volatility",
    ],
  },
] as const;

/** Flattened list of symptoms across all physical categories */
export const SYMPTOMS: string[] = [
  ...new Set(
    EXPERIENCE_CATEGORIES.filter((c) => c.id !== "mood").flatMap((c) => [...c.items]),
  ),
];

/** Flattened list of mood states */
export const MOODS: string[] = [
  ...new Set(
    EXPERIENCE_CATEGORIES.find((c) => c.id === "mood")?.items ?? [
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
    ],
  ),
];

/* ---------- Life Stage Modes ---------- */
export type LifeStageMode =
  | "period_tracking"
  | "clue_conceive"
  | "clue_pregnancy"
  | "perimenopause";

export const LIFE_STAGE_MODES = [
  {
    id: "period_tracking" as LifeStageMode,
    name: "Period Tracking",
    shortName: "Period",
    description: "Cycle predictions, PMS alerts, and everyday wellness logging.",
    focus: "Cycle regularity & symptom management",
  },
  {
    id: "clue_conceive" as LifeStageMode,
    name: "Clue Conceive (Fertility)",
    shortName: "Conceive",
    description: "Pinpoints high and peak fertile days, BBT shifts, and conception chances.",
    focus: "Ovulation timing & fertile window accuracy",
  },
  {
    id: "clue_pregnancy" as LifeStageMode,
    name: "Clue Pregnancy",
    shortName: "Pregnancy",
    description: "Gestational timeline, trimester tracking, kicks, and pregnancy symptoms.",
    focus: "Weekly fetal milestones & prenatal well-being",
  },
  {
    id: "perimenopause" as LifeStageMode,
    name: "Perimenopause",
    shortName: "Perimenopause",
    description: "Tracks hot flashes, night sweats, cycle skips, and hormonal transitions.",
    focus: "Transition symptoms & irregular cycle trends",
  },
] as const;

/* ---------- Birth Control Management ---------- */
export type BirthControlType =
  | "combined_pill"
  | "mini_pill"
  | "hormonal_iud"
  | "copper_iud"
  | "patch"
  | "ring"
  | "implant"
  | "depo_shot"
  | "barrier"
  | "none";

export const BIRTH_CONTROL_METHODS: {
  id: BirthControlType;
  name: string;
  category: "pill" | "device" | "barrier" | "none";
  impactNote: string;
}[] = [
  {
    id: "combined_pill",
    name: "Combined Oral Contraceptive Pill",
    category: "pill",
    impactNote: "Suppresses natural ovulation; bleeds are withdrawal bleeds rather than biological menstruation.",
  },
  {
    id: "mini_pill",
    name: "Progestin-Only Mini Pill",
    category: "pill",
    impactNote: "Requires strict adherence window (within 3 hours daily); cycle lengths may become lighter or irregular.",
  },
  {
    id: "hormonal_iud",
    name: "Hormonal IUD (Mirena / Kyleena)",
    category: "device",
    impactNote: "Significantly reduces menstrual bleed volume over time; many users experience amenorrhea or spotting.",
  },
  {
    id: "copper_iud",
    name: "Copper IUD (ParaGard)",
    category: "device",
    impactNote: "Non-hormonal; natural ovulation preserved, but may cause heavier flow or cramps during initial months.",
  },
  {
    id: "patch",
    name: "Contraceptive Patch",
    category: "device",
    impactNote: "Transdermal weekly replacement; steady hormone release with a scheduled patch-free week.",
  },
  {
    id: "ring",
    name: "Vaginal Ring (NuvaRing)",
    category: "device",
    impactNote: "In place for 3 weeks followed by 1 ring-free week for withdrawal bleeding.",
  },
  {
    id: "implant",
    name: "Contraceptive Implant (Nexplanon)",
    category: "device",
    impactNote: "Subdermal continuous progestin; effective for 3-5 years with variable bleed frequency.",
  },
  {
    id: "depo_shot",
    name: "Depo-Provera Injection",
    category: "device",
    impactNote: "Intramuscular injection every 12 weeks; ovulation suppressed, periods frequently cease.",
  },
  {
    id: "barrier",
    name: "Barrier Methods (Condoms / Diaphragm)",
    category: "barrier",
    impactNote: "Preserves natural biological rhythm with zero hormonal alteration.",
  },
  {
    id: "none",
    name: "Natural Rhythm (No Contraception)",
    category: "none",
    impactNote: "Unmedicated cycle; ideal for fertility awareness and natural phase observation.",
  },
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

export interface ExtendedForecastCycle {
  cycleIndex: number;
  periodStart: Date;
  periodEnd: Date;
  ovulationDate: Date;
  fertileFrom: Date;
  fertileTo: Date;
  confidence: "high" | "medium" | "low";
}

/** Multi-cycle forecasting: projects periods, fertile windows, and ovulation up to N cycles ahead. */
export function predictExtended(
  cycles: CycleRow[],
  cyclesAhead = 6,
  opts: { avgCycleLength?: number; lutealLength?: number; periodLength?: number } = {},
): ExtendedForecastCycle[] {
  const p = predict(cycles, opts);
  if (!p.nextStart) return [];

  const periodDuration = opts.periodLength ?? 5;
  const forecasts: ExtendedForecastCycle[] = [];
  let currentStart = p.nextStart;

  for (let i = 1; i <= cyclesAhead; i++) {
    const periodEnd = addDays(currentStart, periodDuration - 1);
    const nextStart = addDays(currentStart, p.cycleLength);
    const ovulationDate = addDays(nextStart, -p.lutealLength);
    const fertileFrom = addDays(ovulationDate, -5);
    const fertileTo = addDays(ovulationDate, 1);

    const confidence: "high" | "medium" | "low" =
      i === 1 ? p.confidence : i <= 3 ? (p.confidence === "high" ? "medium" : "low") : "low";

    forecasts.push({
      cycleIndex: i,
      periodStart: currentStart,
      periodEnd,
      ovulationDate,
      fertileFrom,
      fertileTo,
      confidence,
    });

    currentStart = nextStart;
  }

  return forecasts;
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

/** Intimacy is logged separately and is never shared in Couples Mode. */
export const INTIMACY_ACTIVITIES = [
  { value: "none", label: "None" },
  { value: "protected", label: "Protected" },
  { value: "unprotected", label: "Unprotected" },
] as const;

export const DESIRE_LABELS = ["Very low", "Low", "Steady", "High", "Very high"] as const;

export const INTIMACY_SYMPTOMS = [
  "Pain during sex",
  "Spotting after sex",
  "Dryness",
  "Cramping after",
] as const;

/** The two worth surfacing to a clinician if they keep showing up. */
export const INTIMACY_FLAGS = ["Pain during sex", "Spotting after sex"] as const;
