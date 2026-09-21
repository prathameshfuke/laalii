import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png.asset.json";
import icon from "@/assets/icon.png.asset.json";
import { Mascot } from "@/components/Mascot";
import { CycleRing } from "@/components/CycleRing";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/data";
import { destinationFor } from "@/lib/routing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laali, your body in context" },
      {
        name: "description",
        content:
          "A calm, private cycle tracker built for two. See where you are today, read patterns instead of promises, and share with your partner only what you choose.",
      },
      { property: "og:title", content: "Laali, your body in context" },
      {
        property: "og:description",
        content:
          "A calm, private cycle tracker with an optional partner view that shows only what you switch on.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Showcase,
});

const PHASE_LEGEND = [
  { name: "Menstrual", days: "Day 1 to 5", color: "var(--rose)", note: "Rest is the work." },
  { name: "Follicular", days: "Day 6 to 12", color: "var(--apricot)", note: "Energy climbing." },
  { name: "Ovulation", days: "Day 13 to 16", color: "var(--marigold)", note: "Peak and pivot." },
  { name: "Luteal", days: "Day 17 to 28", color: "var(--mauve)", note: "Slow and reflective." },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#rhythm", label: "The rhythm" },
    { href: "#practice", label: "Daily practice" },
    { href: "#two", label: "For two" },
    { href: "#privacy", label: "Privacy" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--cream)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <img src={icon.url} alt="" className="h-7 w-7 shrink-0" />
          <img src={logo.url} alt="Laali" className="h-6 w-auto" />
        </div>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="label-meta hover:text-[var(--ink)]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/auth"
            className="hidden rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--cream)]"
          >
            Start tracking
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Open menu"
            className="rounded-full border border-[var(--line)] px-3 py-2 text-sm md:hidden"
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--line)] px-5 py-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}

function PhoneFrame({ mode }: { mode: "her" | "partner" }) {
  const partner = mode === "partner";
  return (
    <div
      className={`${partner ? "partner-skin" : ""} relative mx-auto w-full max-w-[19rem] rounded-[2.6rem] border border-[var(--line)] bg-[var(--shell)] p-3 paper-shadow transition-transform duration-500`}
      style={{ transform: "rotate(-1.4deg)" }}
    >
      <div className="overflow-hidden rounded-[2.1rem] border border-[var(--line)] bg-background">
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="label-meta">{partner ? "Partner view" : "Today"}</span>
          <span className="text-xs text-[var(--muted-ink)]">
            {partner ? "Shared by Aanya" : "Cycle day 14"}
          </span>
        </div>

        <div className="px-4 pb-3 pt-3">
          <p className="font-display text-[1.7rem] leading-tight">
            {partner ? "She is in her ovulation window." : "Ovulation, high energy."}
          </p>
          <p className="mt-1.5 text-sm text-[var(--muted-ink)]">
            {partner
              ? "Context, not a report. She chooses what appears here."
              : "An estimate from your last five cycles, not a promise."}
          </p>
        </div>

        <div className="mx-4 rounded-2xl border border-[var(--line)] bg-card p-3">
          <div className="flex items-center gap-3">
            <Mascot state={partner ? "comforted" : "energetic"} size={54} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {partner ? "A small idea" : "Log your day"}
              </p>
              <p className="truncate text-xs text-[var(--muted-ink)]">
                {partner ? "Plan something outdoors this week." : "Flow, mood, symptoms, energy."}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            {["Light", "Calm", "Cramps", "Tired"].map((chip, i) => (
              <span
                key={chip}
                className="rounded-full px-2.5 py-1 text-[0.68rem]"
                style={{
                  background: `color-mix(in oklab, ${partner ? "var(--sage)" : ["var(--rose)", "var(--apricot)", "var(--marigold)", "var(--mauve)"][i]} 28%, transparent)`,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 border-t border-[var(--line)] text-center">
          {(partner
            ? ["Home", "Insights", "Learn", "You"]
            : ["Home", "Calendar", "Insights", "You"]
          ).map((t, i) => (
            <span
              key={t}
              className={`py-3 text-[0.68rem] ${i === 0 ? "font-semibold text-foreground" : "text-[var(--muted-ink)]"}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Showcase() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mode, setMode] = useState<"her" | "partner">("her");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session || cancelled) return;
      const profile = await qc.ensureQueryData(profileQuery);
      if (!cancelled) navigate({ to: destinationFor(profile), replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, qc]);

  return (
    <div className="grain min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <Nav />

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
        <div className="rise">
          <p className="label-meta">A cycle tracker built for two</p>
          <h1 className="display-xl mt-5">
            Your body,
            <br />
            <em className="italic">in context.</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted-ink)]">
            Laali keeps your cycle legible. Log a day in seconds, watch the pattern take shape, and
            let your partner see only what you switch on.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-[var(--rose)] px-6 py-3 text-sm font-semibold text-[var(--ink)] print-shadow"
            >
              Start tracking
            </Link>
            <Link
              to="/auth"
              search={{ role: "partner" }}
              className="rounded-full border border-[var(--line)] bg-[var(--shell)] px-6 py-3 text-sm font-semibold"
            >
              I am the partner
            </Link>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-ink)]">
            Partners sign in here too, then enter the code they were given.
          </p>
        </div>

        <div>
          <div className="mb-5 flex justify-center">
            <div
              role="tablist"
              aria-label="Preview mode"
              className="inline-flex rounded-full border border-[var(--line)] bg-[var(--shell)] p-1"
            >
              {(["her", "partner"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    mode === m
                      ? m === "partner"
                        ? "bg-[var(--sage)] text-[var(--ink)]"
                        : "bg-[var(--rose)] text-[var(--ink)]"
                      : "text-[var(--muted-ink)]"
                  }`}
                >
                  {m === "her" ? "Her space" : "Partner view"}
                </button>
              ))}
            </div>
          </div>
          <PhoneFrame mode={mode} />
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y border-[var(--line)] bg-[var(--shell)]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 md:grid-cols-[auto_1fr]">
          <span className="font-display text-6xl leading-none text-[var(--rose)]">&ldquo;</span>
          <div>
            <p className="display-lg max-w-3xl">
              Not a prediction machine. A way of <em className="italic">noticing</em>.
            </p>
            <div className="rule-line mt-7 pt-4">
              <p className="max-w-xl text-sm text-[var(--muted-ink)]">
                Cycles move. Laali shows a living estimate with its confidence attached, so you can
                read your body rather than take orders from an app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rhythm */}
      <section id="rhythm" className="mx-auto w-full max-w-6xl px-5 py-20">
        <p className="label-meta">01. The rhythm</p>
        <h2 className="display-lg mt-4 max-w-2xl">
          Make the invisible <em className="italic">legible</em>.
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[auto_1fr] lg:items-center">
          <CycleRing
            cycleLength={28}
            lutealLength={14}
            dayOfCycle={14}
            currentPhase="ovulation"
            loggedDays={[1, 2, 3, 5, 8, 9, 12, 13]}
            confidence="medium"
            headline="Day 14"
            sub="Ovulation window"
            caption="Estimated from your last five cycles"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {PHASE_LEGEND.map((p) => (
              <div
                key={p.name}
                className="lift rounded-2xl border border-[var(--line)] bg-[var(--shell)] p-4"
              >
                <span
                  className="inline-block h-2.5 w-10 rounded-full"
                  style={{ background: p.color }}
                />
                <p className="mt-3 font-display text-xl">{p.name}</p>
                <p className="text-xs text-[var(--muted-ink)]">{p.days}</p>
                <p className="mt-2 text-sm text-[var(--muted-ink)]">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily practice */}
      <section id="practice" className="border-t border-[var(--line)] bg-[var(--shell)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <p className="label-meta">02. Daily practice</p>
          <h2 className="display-lg mt-4 max-w-2xl">Three small gestures.</h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Log in the in-between",
                body: "Waiting for the kettle is long enough. Flow, mood, symptoms and energy, in a few taps.",
                tint: "var(--rose)",
                fragment: (
                  <div className="flex flex-wrap gap-1.5">
                    {["Cramps", "Low mood", "Spotting", "Slept well"].map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-[var(--line)] bg-background px-2.5 py-1 text-[0.7rem]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                title: "Patterns over predictions",
                body: "Laali reads your own history back to you, with the honest range around it.",
                tint: "var(--marigold)",
                fragment: (
                  <div className="flex items-end gap-1.5">
                    {[38, 54, 30, 62, 48, 70, 44].map((h, i) => (
                      <span
                        key={i}
                        className="w-3 rounded-full"
                        style={{
                          height: h,
                          background: `color-mix(in oklab, var(--marigold) ${40 + i * 7}%, transparent)`,
                        }}
                      />
                    ))}
                  </div>
                ),
              },
              {
                title: "A little company",
                body: "Laali the mascot shifts with your phase. Seven moods, no cheerleading.",
                tint: "var(--mauve)",
                fragment: (
                  <div className="flex items-center gap-1">
                    {(["energetic", "comforted", "sleepy", "celebratory"] as const).map((s) => (
                      <Mascot key={s} state={s} size={44} />
                    ))}
                  </div>
                ),
              },
            ].map((card) => (
              <article
                key={card.title}
                className="lift rounded-3xl border border-[var(--line)] p-6"
                style={{ background: `color-mix(in oklab, ${card.tint} 14%, var(--cream))` }}
              >
                <h3 className="font-display text-2xl leading-tight">{card.title}</h3>
                <p className="mt-3 text-sm text-[var(--muted-ink)]">{card.body}</p>
                <div className="mt-6 min-h-20">{card.fragment}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* For two */}
      <section
        id="two"
        className="partner-skin border-y border-[var(--line)] bg-[color-mix(in_oklab,var(--sage)_22%,var(--cream))]"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="label-meta">03. For two</p>
            <h2 className="display-lg mt-4 max-w-xl text-[var(--ink)]">
              Care, <em className="italic">without surveillance</em>.
            </h2>
            <p className="mt-6 max-w-md text-[var(--muted-ink)]">
              Partner mode is a separate, calmer surface. It carries context, never a feed of her
              private life.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Granular sharing. She picks each thing that crosses over.",
                "Instant revocation. One tap and the view goes quiet.",
                "Intimacy notes never travel, with no exceptions.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: "var(--sage-deep)" }}
                  />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              search={{ role: "partner" }}
              className="mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-[var(--cream)]"
              style={{ background: "var(--sage-deep)" }}
            >
              Set up partner mode
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div
              className="petal-mask absolute -inset-4"
              style={{ background: "color-mix(in oklab, var(--sage) 45%, transparent)" }}
            />
            <div className="relative rounded-3xl border border-[var(--line)] bg-[var(--shell)] p-7 print-shadow">
              <p className="label-meta">Today, for you</p>
              <p className="mt-3 font-display text-2xl leading-snug">
                She is likely low on energy. Keep the evening soft.
              </p>
              <div className="rule-line mt-5 pt-4 text-xs text-[var(--muted-ink)]">
                Shared: phase and energy. Hidden: everything else.
              </div>
              <div className="mt-5 flex justify-end">
                <Mascot state="comforted" size={80} bob />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="mx-auto w-full max-w-6xl px-5 py-24">
        <div className="grid gap-12 md:grid-cols-[auto_1fr] md:items-center">
          <div className="relative mx-auto h-48 w-48">
            <span className="absolute inset-0 rounded-full border border-[var(--line)]" />
            <span className="absolute inset-6 rounded-full border border-dashed border-[var(--line)]" />
            <span
              className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full"
              style={{ background: "var(--rose)" }}
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--ink)] text-[var(--cream)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M7 10V7a5 5 0 0 1 10 0v3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <rect
                    x="4.5"
                    y="10"
                    width="15"
                    height="10"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
            </span>
          </div>
          <div>
            <p className="label-meta">04. The promise</p>
            <h2 className="display-lg mt-4 max-w-xl">
              Your data is <em className="italic">yours first</em>.
            </h2>
            <p className="mt-6 max-w-lg text-[var(--muted-ink)]">
              Everything you log is owned by your account and locked to it at the database level.
              Sharing is an action you take, never a default, and you can undo it at any moment.
            </p>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-[var(--ink)] text-[var(--cream)]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="display-lg">
              A gentler way to <em className="italic">know yourself</em>.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-full bg-[var(--rose)] px-6 py-3 text-sm font-semibold text-[var(--ink)]"
              >
                Create your account
              </Link>
              <Link
                to="/auth"
                className="rounded-full border border-[color-mix(in_oklab,var(--cream)_35%,transparent)] px-6 py-3 text-sm font-semibold"
              >
                I already have one
              </Link>
            </div>
          </div>
          <Mascot state="celebratory" size={120} bob />
        </div>
        <div className="mx-auto w-full max-w-6xl px-5 pb-10">
          <p className="text-xs text-[color-mix(in_oklab,var(--cream)_60%,transparent)]">
            Laali. Made for the two of you.
          </p>
        </div>
      </section>
    </div>
  );
}
