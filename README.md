# Laali Together

Build Spec: Laali — A Cycle Tracker Built for Two

This is a full product + design + engineering brief. It's written so you can hand it directly to a designer, a dev, or an AI coding tool (Claude Code, Cursor, v0, etc.) and get a coherent build out of it — not a generic period-tracker clone.

1. Product Vision

A private, gorgeous, mobile-first cycle tracker for one person, with an optional Couples Mode that lets a partner see relevant, consented information and act on it — without turning intimate health data into a shared surveillance feed. The emotional goal: she should open it because it's pretty and useful, not because she has to. He should open it because it makes him a better, more attentive partner, not because he's checking up on her.

Core pillars:

Beautiful, not generic. No stock "wellness app" purple gradients, no default emoji, no Lottie-pack-off-the-shelf animations. A distinct, custom illustration language (see §3).

Smart, but honest about uncertainty. Predictions get better with data and clearly show confidence, not false precision.

Private by default. She controls exactly what's shared to Couples Mode, and can revoke it any time.

Import-friendly. Existing history from her current app should port over so she doesn't lose years of data.

2. Reference UI (what to replicate, what to elevate)

The reference screenshot shows a strong pattern worth keeping:

Top: avatar, date header, horizontal day-of-week strip with dot indicators for logged days, current day highlighted as a filled circle.

A pill-shaped "phase" badge (e.g. "Luteal Phase") with an info affordance.

A large circular ring visualization: filled arc = period + fertile window with dot markers per day, empty arc = remaining cycle, center shows countdown text ("Your next period is due in X days") and a primary action button.

A day counter badge overlapping the ring (e.g. "Day 19").

Bottom: a tags/notes summary and a 5-tab bottom nav.

Where to elevate rather than copy:

Replace the flat dot markers with a custom-drawn, slightly organic ring (subtle noise/hand-drawn wobble on the arc edge, not a perfect vector circle) — this alone kills the "generic Figma template" feel.

Give the ring a soft, animated fill-in on load (arc draws itself in ~600ms with a spring ease, not a linear tween).

Custom mascot/character system (see §3) replacing generic icons in empty states, onboarding, and the mood picker.

Phase badge color and the mascot's expression change with cycle phase — this is a small touch that reads as "someone designed this for a person," not "someone assembled this from a component library."

3. Design System

Palette

Warm, low-saturation, skin-adjacent tones — avoid the cliché hot-pink/purple period-app palette. Suggested base:

Background: warm cream #FBF3E8

Primary accent: dusty rose #E8879E (period days)

Secondary accent: soft apricot #F3C89A (fertile window)

Tertiary: muted sage #A9BCA0 (for couples-mode "support" states — deliberately not pink, so the partner's view doesn't feel infantilizing)

Ink: warm charcoal #3A322E, never pure black

Each cycle phase (Menstrual / Follicular / Ovulation / Luteal) gets its own accent tint used consistently across badges, the ring, and mood-picker backgrounds.

Typography

Pair a warm, slightly humanist serif or rounded display face for numbers/headlines (the "6 Days" countdown deserves personality) with a clean grotesk for body/UI text. Avoid Inter-for-everything — it's the single fastest way an app reads as templated. Numerals should be tabular and slightly oversized where they're the hero (countdown, day count).

Illustration & Motion Language

Mascot and logo are finalized (see §3.1) — a soft, round, chubby character with a leaf/fringe crown, used across empty states, onboarding, notifications, and the mood picker instead of emoji.

Micro-interactions everywhere, but purposeful: logging flow gets a satisfying droplet animation with haptic tap; completing a day's log gets a small confetti/petal-burst; the ring redraws with a spring, not a linear animation; tab transitions use shared-element motion (the ring or badge morphs between screens rather than hard-cutting).

Respect prefers-reduced-motion / a system-level "reduce motion" toggle in-app.

No default Material/iOS system icons for primary actions — draw a consistent icon set (rounded, 2px stroke, single accent fill) so nothing reads as a stock icon pack.

3.1 Brand Assets (finalized)

Logo — assets/logo/

logo.png — wordmark, lowercase "laali" in the warm serif, dusty-rose ink.

icon.png — standalone mark, a teardrop/petal shape split into two curves (cream + dusty rose), doubling as a nod to the cycle ring and a droplet at once. Use this for the app icon and favicon.

Mascot — assets/mascot/ — round, chubby, blush-cheeked character with a scalloped leaf/fringe crown, expressive brow + simple eyes, tiny nub arms. Seven states currently in the set:

neutral.png — default/content state

energetic.png — mid-bounce, sparkles (follicular/ovulation)

tired.png — drooping, sparkle-dust around it (luteal/PMS)

comforted.png — wrapped in a blanket, holding a hot water bottle (period days)

celebertory.png — arms up, petals/sparkles bursting (streaks, milestones) — rename to celebratory.png before wiring into code so the filename doesn't leak the typo into asset keys/imports.

sleepy.png — eyes closed, "Z" motes, curled up (night/reminder states)

distracted.png — looking off to the side, a butterfly nearby — not in the original spec; useful as an idle/loading-state variant, or for a "notice something?" nudge in Couples Mode.

Map these directly to app states: neutral = default ring view, energetic/tired = phase-linked mood hints, comforted = period-day empty states and logging confirmations, celebratory = streaks/milestones, sleepy = evening reminder notifications, distracted = loading/idle states.

What "AI slop" looks like, to explicitly avoid

Purple-to-pink gradients as a crutch; glassmorphism everywhere; generic rounded-rectangle cards with drop shadows and no hierarchy; stock emoji as icons; centered-everything layouts with no asymmetry; Inter/Poppins + default Tailwind palette; AI-generated illustrations with the telltale over-smooth gradient-mesh look. Build a mood board of 5–10 real reference apps/illustrators before starting visual design and deviate from any single one of them.

4. Core Features

Cycle logging

One-tap flow logging (spotting / light / medium / heavy) with the droplet animation above.

Symptom and mood tagging (cramps, headache, bloating, energy, sleep, custom tags) via a fast multi-select sheet, not a form.

Optional notes, photos (e.g. for skin/symptom tracking), basal body temp and cervical mucus fields for users who want fertility-level detail — but hidden behind an "advanced tracking" toggle so casual users aren't overwhelmed.

Predictions

Next period start date, ovulation window, fertile window — each shown with a confidence indicator (e.g. a soft gradient fade at the edge of the predicted range rather than a hard line) once enough data exists.

Mood/symptom forecasting: "You've historically logged low energy and cramps around this day" style insights, not deterministic claims.

Couples Mode

Opt-in, per-category sharing: she chooses whether he sees cycle phase only, phase + mood, or phase + mood + symptoms. Nothing is shared by default.

His view is a distinct UI (sage/neutral palette, not pink) showing: current phase, "how she might be feeling," and a daily suggested action ("she's logged cramps two days running — maybe grab a heating pad" / "ovulation window — she mentioned wanting X") sourced from her notes/tags, never fabricated.

Gentle nudges to him, not alarms — e.g. a single daily card, not push-notification spam.

A revoke-access control that's one tap and takes effect immediately, with no notification shaming ("she turned off sharing") — silence is fine.

Shared milestones are opt-in fun, not obligatory (anniversaries of tracking, cycle-length trivia, etc.) — this should never feel like the app is grading the relationship.

Insights

Cycle length trend chart (with the organic/hand-drawn styling from §3, not a default line chart).

Symptom-frequency-by-phase breakdown once enough history exists.

Privacy & security

Biometric app lock, local encryption at rest, no data sale, exportable/deletable data at any time.

Clear, plain-language privacy copy — this is health data and the copy should never feel like a EULA.

5. Data Import from Simple Design Ltd's "Period Tracker & Calendar"

I checked: as of now, Simple Design Ltd's app (published under the SimpleInnovation name) backs data up via a Google account or an email-based backup/restore flow, but I could not confirm a public CSV/JSON export or an open API — it appears to be a closed backup format tied to their own service, not a portable export. Plan the import feature around that reality rather than assuming a clean file export exists:

Primary path — guided manual import. Build a fast "bring your history" flow: a compact calendar multi-select or a repeating date-range picker where she can log past period start/end dates in bulk (e.g. "Aug 1–5, Jul 3–7, ...") in under a couple of minutes, seeded from whatever she remembers or can see in her old app while switching over. This is the most reliable option since it needs no cooperation from the other app.

Fallback — screenshot-assisted import. As a stretch feature, let her screenshot her old app's calendar/history view and use on-device OCR (or a Vision-capable model call) to extract candidate dates, which she then confirms/edits before they're saved. Always require her confirmation — never auto-commit OCR'd health data.

Do not attempt to scrape the old app's backup email or reverse-engineer its backup file format — that's fragile, likely against their terms, and not worth building against.

Design the onboarding so this import step feels like a natural "let's get your history in so predictions are accurate from day one" moment, with the ring visualization already partially filled in as a preview — a nice reveal moment.

6. Prediction / ML System

Be honest about staging this — a "real" ML model with almost no data will predict worse than simple statistics, and false-precision predictions are the fastest way to lose trust in a health app.

Phase 1 — MVP (cold start, works from day one):

Next period predicted from a weighted rolling average of her last 3–6 logged (or imported) cycle lengths, more weight on recent cycles.

Fertile/ovulation window from standard luteal-phase-length heuristics (ovulation ≈ next period date − 14 days, ± a variance band), which is the same approach clinically-oriented apps use.

Confidence band = based on the standard deviation of her historical cycle lengths — tight band for regular cycles, wide band for irregular ones. This is what should visually create the confidence fade mentioned in §4.

Phase 2 — personalized model (once she has ~6+ logged cycles):

Move from a fixed weighted average to a small per-user model — a Bayesian update on cycle length (treat each new cycle as evidence updating a prior), or a lightweight regression using cycle length, symptom logs, and stress/sleep tags as features if you're collecting them. This can run entirely on-device (e.g. a small model via Core ML / TensorFlow Lite) — no need to ship health data to a server for this.

Mood/symptom forecasting: build a per-user, per-phase frequency table from her own logged history ("of your last 8 luteal phases, cramps were logged in 6") and surface it as a probabilistic note, not a prediction — this avoids ever telling her how she'll feel, only what's historically been common for her.

Phase 3 — stretch:

Cross-cycle pattern detection (e.g. correlating logged sleep/stress with cycle length variance) if you're collecting that data and she's opted in.

Keep the model interpretable enough that you can always show "why" a prediction says what it does — a black-box mood prediction is both a UX and a trust problem in this category.

7. Suggested Tech Stack (mobile-first)

Client: React Native (Expo) or Flutter — either is fine; Expo is faster to iterate on for a two-person team and has good animation libraries (Reanimated + Skia for the custom ring/arc drawing).

Local data: on-device encrypted store (e.g. SQLite via a library with SQLCipher, or Expo SecureStore for smaller data) so cycle data works fully offline and privacy claims are actually true.

Backend: Supabase (Postgres + Auth + Row Level Security) for the data she explicitly opts to share in Couples Mode, scoped per-category as in §4 — don't sync her full log to a server if she hasn't opted into sharing it. Use RLS policies keyed on her sharing preferences rather than filtering in application code, so a bug in the client can't accidentally over-share.

Deployment: Vercel for any web-facing surface (marketing site, web companion, or an admin/insights dashboard if you build one) and Railway for any long-running backend services outside Supabase (e.g. the push-notification trigger service for Couples Mode nudges, or a background job for cycle-length recalculation).

On-device ML: TensorFlow Lite or Core ML for the Phase 2 model; Phase 1 needs no ML infra at all, just the statistical logic above.

Notifications: local scheduled notifications for her reminders; a small server-triggered push only for Couples Mode nudges (since those need to reach a second device).

8. MVP Scope (build this first)

Onboarding + guided manual history import (§5.1)

Core cycle ring UI + daily logging (flow, mood, symptoms) with the custom motion language

Phase 1 statistical predictions with confidence bands

Basic insights (cycle length trend)

Local encryption + biometric lock

Ship Couples Mode and OCR import as v1.1/v2 — they're the features most likely to eat design and engineering time, and the core solo experience needs to be excellent on its own first.

9. Open Decisions to Make Before Building

Whether Couples Mode ships as a separate app/view for him, or a role toggle inside one app.

iOS/Android/both, and whether to use Expo or bare React Native given the native ML + Skia needs.

Whether to expand the mascot set (e.g. an explicit "period" or "ovulation" state distinct from the current phase-linked mapping) or keep the current seven states doing double duty. Build Prompt: Laali — Full Page/Screen List (v2 — Expanded)

Companion to the main build spec (period-app-build-prompt.md). This replaces the earlier page list. Two things drove the rewrite: the app felt thin (too few pages, each doing too little) and it felt boring (generic list/table layouts, default components, no personality). This version fixes both — more pages, and explicit direction for why each one won't read as generic.

Hard rule across every page: no emoji, anywhere. Not in copy, not as bullet markers, not as status icons, not in empty states. Every place you're tempted to reach for an emoji, use either a custom line icon (2px stroke, single accent fill, from the icon set in the main spec) or a mascot expression. This is non-negotiable — emoji is the single fastest way any of this reads as a generic app.

Why things felt boring, and the fix baked into this list:

Most "boring" period-app pages are just a FlatList of rows with an icon-left, text-right layout repeated forever. This doc calls out, per section, where to break that pattern with a different layout shape (timeline, card carousel, radial, collage, full-bleed illustration) instead of defaulting to a list.

Every page below should have one thing that's unmistakably Laali's — a mascot moment, a custom chart shape, an unusual layout, or a line of copy with actual personality — not just the brand colors applied to a stock template.

Copy matters as much as layout. Avoid clinical/app-generic phrasing ("No data available") in favor of voice that sounds like it was written by a person who cares about her, not a form validator.

A. Onboarding & Auth

Welcome / Splash — logo mark animates in (the petal splits and settles), tagline, single CTA. No feature carousel — earn the app in use, don't pitch it up front.

Account creation — email/Apple/Google via Supabase Auth. Keep this screen boring on purpose (auth screens should be fast and forgettable) — save personality budget for everywhere else.

"Tell us a bit about you" — name, birth year range, average cycle estimate, all skippable. Layout: one question full-screen at a time with a progress dot trail, not a stacked form — it should feel like a conversation, not paperwork.

History import — choice screen — "Bring your history" vs. "Start fresh," presented as two large illustrated cards, not a dialog with two buttons.

History import — guided manual entry — bulk date-range picker.

History import — screenshot/OCR entry (stretch) — upload, review extracted dates before confirming.

Notification permissions — story screen — explain each notification type as a short illustrated card sequence before the OS prompt, not a paragraph of legalese.

Couples Mode intro — skippable, framed as an invitation ("want someone in your corner?") not a feature dump.

Onboarding complete — mascot celebratory, ring preview animates in if import data exists. This is the first real "wow" moment — worth extra animation polish.

Name-your-mascot (new) — let her optionally rename the mascot character. Small touch, disproportionately high attachment payoff, costs almost nothing to build (one string field).

B. Core / Home

Home (Cycle Ring) — day strip, phase badge, ring, countdown, quick-log button, tags summary. The ring is already the one non-generic layout element here — protect it, don't let a settings gear or extra icons crowd it.

Day detail (bottom sheet) — tap any day, see/edit what was logged.

Quick-log flow — flow → symptoms/mood → note/photo → confirm, mascot reacts.

Advanced tracking entry — BBT, cervical mucus, medication log, behind a toggle.

"Today for you" (new) — a single home-adjacent card (accessible via a swipe or a tab) that surfaces one relevant, personal thing for today only — a phase-appropriate self-care suggestion, a gentle reminder of a pattern ("you've logged low energy around this day before — maybe an easy day"), or nothing at all if there's nothing worth saying. This is the page most responsible for the app feeling considerate rather than administrative — keep it to one card, never a feed.

Streaks & consistency (new) — how many days/cycles she's logged consistently, shown as a small radial/ring motif (echoing the home ring, not a generic progress bar), mascot state tied to streak length.

C. Calendar & History

Full calendar view — month grid, color-coded by phase.

Cycle history — timeline layout (redesigned) — replace the plain chronological list with a horizontal scrollable timeline of past cycles as cards (length, flow summary, one symptom highlight), swipeable rather than a vertical list — this is one of the highest-value "de-boring" changes on the whole list.

Symptom/tag history — filterable log, but rendered as a tag-cloud/filter-chip view you narrow down, not a raw table.

Cycle Story (new) — a "Spotify Wrapped"-style recap generated per cycle or per year: a short, swipeable sequence of full-bleed illustrated cards summarizing that cycle/year (average length, most logged symptom, longest streak, a gentle observation). This is a genuinely delightful, non-generic page and worth real design investment.

D. Insights

Insights dashboard — cycle length trend, average length, regularity — but render the trend as a custom organic line (hand-drawn wobble, matches main spec §3) rather than a default chart-library line chart.

Phase-linked patterns — "of your last 8 luteal phases, cramps were logged in 6," shown as a horizontal card carousel, one pattern per card, not a stacked list.

Prediction confidence explainer — plain-language "why this prediction" breakdown.

Doctor/export report (new) — generate a clean, printable-style summary of recent cycles and symptoms for a doctor's visit. Genuinely useful, differentiates from a purely emotional feature set, and reuses the same illustrated-card visual language rather than looking like a spreadsheet dump.

E. Education & Care (new section)

Existing spec had zero content/education pages — every major competitor (Flo, Clue) leans on this, and it's also where "considerate app" personality has the most room to show up.

Learn hub — short, swipeable articles/cards on cycle health, organized by phase or topic, illustrated per-card rather than a generic blog list.

Phase guide — for whichever phase she's currently in, a short explainer of what's typically happening in the body and what might help — reachable directly from tapping the phase badge on Home.

Self-care ritual suggestions — phase-linked, e.g. gentle movement/rest/nutrition ideas, presented as a small stack of dismissible cards, not a checklist.

F. Couples Mode

Invite partner — generate invite link/code, choose initial sharing level.

Sharing preferences — granular per-category toggles, revoke control.

Partner's home view (sage/neutral palette, distinct from her app) — current phase, "how she might be feeling," daily suggested action.

Partner's history view — read-only, scoped to what's shared.

Shared milestones — streaks, tracking anniversaries, opt-in.

"Send a little something" (new) — a lightweight, non-transactional gesture feature: he can send a small in-app note/gesture ("thinking of you," "want me to grab anything on the way home?") tied to her current phase-suggested needs. Keep this to preset gentle prompts plus a free-text option — do not build real commerce/gifting into v1, just the gesture layer.

Couples Mode settings — manage sharing, disconnect, notification frequency for his nudges.

G. Settings

Settings home — account, notifications, privacy, Couples Mode, appearance, help.

Notification preferences — granular toggles, discreet custom text option.

Privacy & security — biometric lock, data export, delete data, plain-language explainer.

Cycle settings — cycle/luteal length overrides, prediction mode (auto vs. manual).

Appearance — theme/accent variant, reduce-motion toggle, mascot rename (link from here too).

Account management — email/password, linked accounts, delete account.

Help & support — FAQ, contact, not a generic support-ticket form if avoidable — keep the voice consistent with the rest of the app.

H. System / Edge-case screens

Empty states (per section) — each major section (calendar, insights, Cycle Story, Learn hub) gets its own empty state illustration/copy, not one reused generic "no data" screen. This alone meaningfully reduces the "boring/thin" feeling since it's usually the first thing a new user sees repeatedly.

Error/offline states — reassure that local data is safe.

Permission-denied fallback — graceful degrade for notifications/OCR.

Delete/edit confirmation modals — entries, partner disconnection, account deletion.

Loading/idle states — use distracted mascot state, not a bare spinner, anywhere a load takes more than ~1s.

Priority guidance (what actually moves the "boring/thin" feeling)

If you can't build all 46 pages, build these first — they're the highest ratio of perceived polish to effort:

Cycle History as a timeline (18) instead of a list — biggest single "this doesn't feel generic anymore" win for the least work, since it's a layout change to a page you already have.

Cycle Story recap (20) — the most shareable, most delightful page in the whole app; nothing else here creates the same "oh, that's actually really nice" reaction.

Per-section empty states (42) — cheap to build, appears constantly, currently the most repeated generic surface in a thin app.

"Today for you" card (15) — turns Home from "a ring and a countdown" into something that feels attentive every single day.

Learn hub + Phase guide (25, 26) — fills the "this app feels thin" gap directly by giving it real content depth, not just tracking mechanics.

Everything else in this list is real and worth building, but those five are where "boring and too few pages" gets fixed fastest. Build Spec: Laali — A Cycle Tracker Built for Two

This is a full product + design + engineering brief. It's written so you can hand it directly to a designer, a dev, or an AI coding tool (Claude Code, Cursor, v0, etc.) and get a coherent build out of it — not a generic period-tracker clone.

1. Product Vision

A private, gorgeous, mobile-first cycle tracker for one person, with an optional Couples Mode that lets a partner see relevant, consented information and act on it — without turning intimate health data into a shared surveillance feed. The emotional goal: she should open it because it's pretty and useful, not because she has to. He should open it because it makes him a better, more attentive partner, not because he's checking up on her.

Core pillars:

Beautiful, not generic. No stock "wellness app" purple gradients, no default emoji, no Lottie-pack-off-the-shelf animations. A distinct, custom illustration language (see §3).

Smart, but honest about uncertainty. Predictions get better with data and clearly show confidence, not false precision.

Private by default. She controls exactly what's shared to Couples Mode, and can revoke it any time.

Import-friendly. Existing history from her current app should port over so she doesn't lose years of data.

2. Reference UI (what to replicate, what to elevate)

The reference screenshot shows a strong pattern worth keeping:

Top: avatar, date header, horizontal day-of-week strip with dot indicators for logged days, current day highlighted as a filled circle.

A pill-shaped "phase" badge (e.g. "Luteal Phase") with an info affordance.

A large circular ring visualization: filled arc = period + fertile window with dot markers per day, empty arc = remaining cycle, center shows countdown text ("Your next period is due in X days") and a primary action button.

A day counter badge overlapping the ring (e.g. "Day 19").

Bottom: a tags/notes summary and a 5-tab bottom nav.

Where to elevate rather than copy:

Replace the flat dot markers with a custom-drawn, slightly organic ring (subtle noise/hand-drawn wobble on the arc edge, not a perfect vector circle) — this alone kills the "generic Figma template" feel.

Give the ring a soft, animated fill-in on load (arc draws itself in ~600ms with a spring ease, not a linear tween).

Custom mascot/character system (see §3) replacing generic icons in empty states, onboarding, and the mood picker.

Phase badge color and the mascot's expression change with cycle phase — this is a small touch that reads as "someone designed this for a person," not "someone assembled this from a component library."

3. Design System

Palette

Warm, low-saturation, skin-adjacent tones — avoid the cliché hot-pink/purple period-app palette. Suggested base:

Background: warm cream #FBF3E8

Primary accent: dusty rose #E8879E (period days)

Secondary accent: soft apricot #F3C89A (fertile window)

Tertiary: muted sage #A9BCA0 (for couples-mode "support" states — deliberately not pink, so the partner's view doesn't feel infantilizing)

Ink: warm charcoal #3A322E, never pure black

Each cycle phase (Menstrual / Follicular / Ovulation / Luteal) gets its own accent tint used consistently across badges, the ring, and mood-picker backgrounds.

Typography

Pair a warm, slightly humanist serif or rounded display face for numbers/headlines (the "6 Days" countdown deserves personality) with a clean grotesk for body/UI text. Avoid Inter-for-everything — it's the single fastest way an app reads as templated. Numerals should be tabular and slightly oversized where they're the hero (countdown, day count).

Illustration & Motion Language

Mascot and logo are finalized (see §3.1) — a soft, round, chubby character with a leaf/fringe crown, used across empty states, onboarding, notifications, and the mood picker instead of emoji.

Micro-interactions everywhere, but purposeful: logging flow gets a satisfying droplet animation with haptic tap; completing a day's log gets a small confetti/petal-burst; the ring redraws with a spring, not a linear animation; tab transitions use shared-element motion (the ring or badge morphs between screens rather than hard-cutting).

Respect prefers-reduced-motion / a system-level "reduce motion" toggle in-app.

No default Material/iOS system icons for primary actions — draw a consistent icon set (rounded, 2px stroke, single accent fill) so nothing reads as a stock icon pack.

3.1 Brand Assets (finalized)

Logo — assets/logo/

logo.png — wordmark, lowercase "laali" in the warm serif, dusty-rose ink.

icon.png — standalone mark, a teardrop/petal shape split into two curves (cream + dusty rose), doubling as a nod to the cycle ring and a droplet at once. Use this for the app icon and favicon.

Mascot — assets/mascot/ — round, chubby, blush-cheeked character with a scalloped leaf/fringe crown, expressive brow + simple eyes, tiny nub arms. Seven states currently in the set:

neutral.png — default/content state

energetic.png — mid-bounce, sparkles (follicular/ovulation)

tired.png — drooping, sparkle-dust around it (luteal/PMS)

comforted.png — wrapped in a blanket, holding a hot water bottle (period days)

celebertory.png — arms up, petals/sparkles bursting (streaks, milestones) — rename to celebratory.png before wiring into code so the filename doesn't leak the typo into asset keys/imports.

sleepy.png — eyes closed, "Z" motes, curled up (night/reminder states)

distracted.png — looking off to the side, a butterfly nearby — not in the original spec; useful as an idle/loading-state variant, or for a "notice something?" nudge in Couples Mode.

Map these directly to app states: neutral = default ring view, energetic/tired = phase-linked mood hints, comforted = period-day empty states and logging confirmations, celebratory = streaks/milestones, sleepy = evening reminder notifications, distracted = loading/idle states.

What "AI slop" looks like, to explicitly avoid

Purple-to-pink gradients as a crutch; glassmorphism everywhere; generic rounded-rectangle cards with drop shadows and no hierarchy; stock emoji as icons; centered-everything layouts with no asymmetry; Inter/Poppins + default Tailwind palette; AI-generated illustrations with the telltale over-smooth gradient-mesh look. Build a mood board of 5–10 real reference apps/illustrators before starting visual design and deviate from any single one of them.

4. Core Features

Cycle logging

One-tap flow logging (spotting / light / medium / heavy) with the droplet animation above.

Symptom and mood tagging (cramps, headache, bloating, energy, sleep, custom tags) via a fast multi-select sheet, not a form.

Optional notes, photos (e.g. for skin/symptom tracking), basal body temp and cervical mucus fields for users who want fertility-level detail — but hidden behind an "advanced tracking" toggle so casual users aren't overwhelmed.

Predictions

Next period start date, ovulation window, fertile window — each shown with a confidence indicator (e.g. a soft gradient fade at the edge of the predicted range rather than a hard line) once enough data exists.

Mood/symptom forecasting: "You've historically logged low energy and cramps around this day" style insights, not deterministic claims.

Couples Mode

Opt-in, per-category sharing: she chooses whether he sees cycle phase only, phase + mood, or phase + mood + symptoms. Nothing is shared by default.

His view is a distinct UI (sage/neutral palette, not pink) showing: current phase, "how she might be feeling," and a daily suggested action ("she's logged cramps two days running — maybe grab a heating pad" / "ovulation window — she mentioned wanting X") sourced from her notes/tags, never fabricated.

Gentle nudges to him, not alarms — e.g. a single daily card, not push-notification spam.

A revoke-access control that's one tap and takes effect immediately, with no notification shaming ("she turned off sharing") — silence is fine.

Shared milestones are opt-in fun, not obligatory (anniversaries of tracking, cycle-length trivia, etc.) — this should never feel like the app is grading the relationship.

Insights

Cycle length trend chart (with the organic/hand-drawn styling from §3, not a default line chart).

Symptom-frequency-by-phase breakdown once enough history exists.

Privacy & security

Biometric app lock, local encryption at rest, no data sale, exportable/deletable data at any time.

Clear, plain-language privacy copy — this is health data and the copy should never feel like a EULA.

5. Data Import from Simple Design Ltd's "Period Tracker & Calendar"

I checked: as of now, Simple Design Ltd's app (published under the SimpleInnovation name) backs data up via a Google account or an email-based backup/restore flow, but I could not confirm a public CSV/JSON export or an open API — it appears to be a closed backup format tied to their own service, not a portable export. Plan the import feature around that reality rather than assuming a clean file export exists:

Primary path — guided manual import. Build a fast "bring your history" flow: a compact calendar multi-select or a repeating date-range picker where she can log past period start/end dates in bulk (e.g. "Aug 1–5, Jul 3–7, ...") in under a couple of minutes, seeded from whatever she remembers or can see in her old app while switching over. This is the most reliable option since it needs no cooperation from the other app.

Fallback — screenshot-assisted import. As a stretch feature, let her screenshot her old app's calendar/history view and use on-device OCR (or a Vision-capable model call) to extract candidate dates, which she then confirms/edits before they're saved. Always require her confirmation — never auto-commit OCR'd health data.

Do not attempt to scrape the old app's backup email or reverse-engineer its backup file format — that's fragile, likely against their terms, and not worth building against.

Design the onboarding so this import step feels like a natural "let's get your history in so predictions are accurate from day one" moment, with the ring visualization already partially filled in as a preview — a nice reveal moment.

6. Prediction / ML System

Be honest about staging this — a "real" ML model with almost no data will predict worse than simple statistics, and false-precision predictions are the fastest way to lose trust in a health app.

Phase 1 — MVP (cold start, works from day one):

Next period predicted from a weighted rolling average of her last 3–6 logged (or imported) cycle lengths, more weight on recent cycles.

Fertile/ovulation window from standard luteal-phase-length heuristics (ovulation ≈ next period date − 14 days, ± a variance band), which is the same approach clinically-oriented apps use.

Confidence band = based on the standard deviation of her historical cycle lengths — tight band for regular cycles, wide band for irregular ones. This is what should visually create the confidence fade mentioned in §4.

Phase 2 — personalized model (once she has ~6+ logged cycles):

Move from a fixed weighted average to a small per-user model — a Bayesian update on cycle length (treat each new cycle as evidence updating a prior), or a lightweight regression using cycle length, symptom logs, and stress/sleep tags as features if you're collecting them. This can run entirely on-device (e.g. a small model via Core ML / TensorFlow Lite) — no need to ship health data to a server for this.

Mood/symptom forecasting: build a per-user, per-phase frequency table from her own logged history ("of your last 8 luteal phases, cramps were logged in 6") and surface it as a probabilistic note, not a prediction — this avoids ever telling her how she'll feel, only what's historically been common for her.

Phase 3 — stretch:

Cross-cycle pattern detection (e.g. correlating logged sleep/stress with cycle length variance) if you're collecting that data and she's opted in.

Keep the model interpretable enough that you can always show "why" a prediction says what it does — a black-box mood prediction is both a UX and a trust problem in this category.

7. Suggested Tech Stack (mobile-first)

Client: React Native (Expo) or Flutter — either is fine; Expo is faster to iterate on for a two-person team and has good animation libraries (Reanimated + Skia for the custom ring/arc drawing).

Local data: on-device encrypted store (e.g. SQLite via a library with SQLCipher, or Expo SecureStore for smaller data) so cycle data works fully offline and privacy claims are actually true.

Backend: Supabase (Postgres + Auth + Row Level Security) for the data she explicitly opts to share in Couples Mode, scoped per-category as in §4 — don't sync her full log to a server if she hasn't opted into sharing it. Use RLS policies keyed on her sharing preferences rather than filtering in application code, so a bug in the client can't accidentally over-share.

Deployment: Vercel for any web-facing surface (marketing site, web companion, or an admin/insights dashboard if you build one) and Railway for any long-running backend services outside Supabase (e.g. the push-notification trigger service for Couples Mode nudges, or a background job for cycle-length recalculation).

On-device ML: TensorFlow Lite or Core ML for the Phase 2 model; Phase 1 needs no ML infra at all, just the statistical logic above.

Notifications: local scheduled notifications for her reminders; a small server-triggered push only for Couples Mode nudges (since those need to reach a second device).

8. MVP Scope (build this first)

Onboarding + guided manual history import (§5.1)

Core cycle ring UI + daily logging (flow, mood, symptoms) with the custom motion language

Phase 1 statistical predictions with confidence bands

Basic insights (cycle length trend)

Local encryption + biometric lock

Ship Couples Mode and OCR import as v1.1/v2 — they're the features most likely to eat design and engineering time, and the core solo experience needs to be excellent on its own first.

9. Open Decisions to Make Before Building

Whether Couples Mode ships as a separate app/view for him, or a role toggle inside one app.

iOS/Android/both, and whether to use Expo or bare React Native given the native ML + Skia needs.

Whether to expand the mascot set (e.g. an explicit "period" or "ovulation" state distinct from the current phase-linked mapping) or keep the current seven states doing double duty. Fix Prompt: Distinct Color Per Cycle Phase on the Ring

Change: The ring currently shows only two colors (rose for elapsed/period, apricot for the fertile window). Update it so each of the four cycle phases gets its own distinct color segment, and use these same tokens everywhere phase color already appears (phase badge, day dots, mood-picker backgrounds) so it stays consistent app-wide, not just on the ring.

Phase color tokens (add to the palette):

export const phaseColors = {
  menstrual:  '#E8879E', // dusty rose — unchanged
  follicular: '#F3C89A', // apricot — unchanged
  ovulation:  '#E8A33D', // warm marigold — new, marks the fertile peak distinctly from follicular
  luteal:     '#B99BC4', // soft mauve — matches the existing "Luteal Phase" badge color already in use
};


What to update:

Ring arc — instead of two segments (rose/apricot), render four segments along the elapsed portion of the ring, one per phase, using phaseColors above, boundaries taken from the same phase-length logic already driving predictions. Keep the remaining/未elapsed track in the current light neutral color.

Phase badge — background/icon tint should pull from the same phaseColors[currentPhase] token instead of any separately hardcoded badge color, so badge and ring always agree.

Day dots on the ring — each dot's fill should match phaseColors[phaseForThatDay] rather than a flat rose for all of them.

Segment transitions — short blended gradient (~5–8°) at each phase boundary on the arc, not a hard color cut, so it reads as a gradual shift rather than four separate stripes.

Result: one shared phaseColors source of truth, four visually distinct phases on the ring, and the badge/dots staying in sync with whatever the ring shows. we want a partner mode that can connect two people

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://laalii.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a9f1db63-c47f-436e-bba1-216d222dce67).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
