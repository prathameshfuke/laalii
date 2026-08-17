import { useEffect, useRef, useState } from "react";
import { PHASES, phaseSegments, type Phase } from "@/lib/cycle";

const SIZE = 260;
const C = SIZE / 2;
const R = 104;

function wobblyArc(fromDay: number, toDay: number, cycleLength: number, seed: number) {
  const pts: string[] = [];
  const startAngle = ((fromDay - 1) / cycleLength) * 360 - 90;
  const endAngle = (toDay / cycleLength) * 360 - 90;
  const step = 2;
  for (let a = startAngle; a <= endAngle + 0.001; a += step) {
    const rad = (a * Math.PI) / 180;
    const jitter = Math.sin((a + seed * 37) / 9) * 1.4 + Math.cos((a + seed * 11) / 5) * 0.9;
    const r = R + jitter;
    const x = C + r * Math.cos(rad);
    const y = C + r * Math.sin(rad);
    pts.push(`${pts.length === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function pointOnRing(day: number, cycleLength: number, radius = R) {
  const angle = (((day - 0.5) / cycleLength) * 360 - 90) * (Math.PI / 180);
  return { x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) };
}

export function CycleRing({
  cycleLength,
  lutealLength,
  dayOfCycle,
  currentPhase,
  loggedDays = [],
  confidence = "medium",
  caption,
  headline,
  sub,
}: {
  cycleLength: number;
  lutealLength: number;
  dayOfCycle: number | null;
  currentPhase: Phase | null;
  loggedDays?: number[];
  confidence?: "low" | "medium" | "high";
  caption?: string;
  headline: string;
  sub?: string;
}) {
  const segments = phaseSegments(cycleLength, lutealLength);
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 30);
    return () => clearTimeout(t);
  }, []);

  const fadeStart = confidence === "high" ? 0.92 : confidence === "medium" ? 0.8 : 0.62;

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg ref={ref} width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img"
        aria-label={`Cycle ring, day ${dayOfCycle ?? "unknown"} of ${cycleLength}`}>
        <defs>
          <mask id="confidence-fade">
            <rect width={SIZE} height={SIZE} fill="white" />
            <circle
              cx={pointOnRing(cycleLength, cycleLength).x}
              cy={pointOnRing(cycleLength, cycleLength).y}
              r={(1 - fadeStart) * 160}
              fill="black"
              opacity="0.55"
            />
          </mask>
        </defs>

        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.7" />

        <g mask="url(#confidence-fade)">
          {segments.map((seg, i) => {
            const d = wobblyArc(seg.from, seg.to, cycleLength, i + 1);
            return (
              <path
                key={seg.phase}
                d={d}
                fill="none"
                stroke={PHASES[seg.phase].color}
                strokeWidth={currentPhase === seg.phase ? 13 : 9}
                strokeLinecap="round"
                opacity={currentPhase && currentPhase !== seg.phase ? 0.45 : 1}
                style={{
                  strokeDasharray: 900,
                  strokeDashoffset: drawn ? 0 : 900,
                  transition: `stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1) ${i * 90}ms, stroke-width 300ms ease`,
                }}
              />
            );
          })}
        </g>

        {loggedDays.map((d) => {
          const p = pointOnRing(d, cycleLength, R - 17);
          return <circle key={d} cx={p.x} cy={p.y} r="2.6" fill="var(--ink)" opacity="0.35" />;
        })}

        {dayOfCycle ? (
          (() => {
            const p = pointOnRing(dayOfCycle, cycleLength);
            return (
              <g className="pop">
                <circle cx={p.x} cy={p.y} r="10" fill="var(--card)" stroke="var(--ink)" strokeWidth="2" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill={currentPhase ? PHASES[currentPhase].color : "var(--rose)"}
                />
              </g>
            );
          })()
        ) : null}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        {caption ? (
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">{caption}</span>
        ) : null}
        <span className="numeral mt-1 text-5xl leading-none">{headline}</span>
        {sub ? <span className="mt-2 text-xs text-muted-foreground">{sub}</span> : null}
      </div>
    </div>
  );
}
