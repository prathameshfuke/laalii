# Laali — cycle tracker built for two

A private, mobile-first cycle tracker with a warm, hand-made feel, plus a separate partner section that only ever shows what she has explicitly shared.

Note on platform: this builds as a mobile-first web app (installable to a phone home screen), not a React Native app. Skia/Core ML/biometric APIs from the brief map to web equivalents: SVG/Canvas for the organic ring, on-device JS statistics for predictions, and a passcode + device passkey lock instead of native biometrics.

## Brand and design system

- Palette: cream `#FBF3E8` background, warm charcoal `#3A322E` ink, dusty rose `#E8879E`, apricot `#F3C89A`, marigold `#E8A33D`, mauve `#B99BC4`, sage `#A9BCA0` (partner side only).
- One `phaseColors` source of truth — menstrual rose, follicular apricot, ovulation marigold, luteal mauve — driving ring segments, phase badge, day dots, and mood-picker backgrounds together.
- Type: Lora for headline numerals and countdowns (tabular, oversized), Nunito Sans for UI text.
- Uploaded assets wired in: wordmark, icon (also the favicon), and seven mascot states (`celebertory.png` imported as `celebratory`). Mascot replaces every empty-state graphic and status icon. No emoji anywhere.
- Custom 2px-stroke line icon set for nav and primary actions; no stock icon pack look.
- Motion: ring arc draws in with a spring over ~600ms, droplet animation on flow logging, petal burst on completing a day, blended ~6° gradient at each phase boundary. Full reduce-motion honoring via media query plus an in-app toggle.

## Her app

Home — day strip with logged-day dots, phase badge, organic four-phase ring with day dots and confidence fade, countdown, quick-log button, tags summary, "Today for you" single card.

Logging — bottom sheet flow: flow level, then multi-select symptoms/mood chips, then note, with mascot reacting. Advanced tracking (BBT, cervical mucus, medication) behind a toggle.

Calendar and history — month grid colored by phase; cycle history as a horizontal swipeable card timeline, not a list; symptom history as filter chips; Cycle Story as a swipeable full-bleed recap sequence.

Insights — cycle-length trend drawn as a hand-wobbled organic line, phase-pattern cards in a carousel, prediction confidence explainer, printable doctor summary.

Learn — phase guide reachable from the phase badge, short illustrated card articles, phase-linked self-care card stack.

Onboarding — welcome with animating mark, account creation, one-question-at-a-time profile, "bring your history vs start fresh" illustrated cards, bulk date-range history import, notification story cards, couples intro, celebratory finish with the ring pre-filled from imported data, optional mascot naming.

Settings — notifications, privacy and app lock, data export/delete, cycle length overrides, appearance and reduce motion, account, help.

## Partner section (`/partner`)

Distinct sage/neutral palette, own nav, same login system.

- Invite by code/link from her side; she picks the sharing level at invite time.
- Sharing preferences: per-category toggles (phase / mood / symptoms), one-tap revoke that takes effect immediately with no notification to him.
- His home: current phase, "how she might be feeling", one daily suggested action derived only from her actual logs — never invented.
- Read-only history scoped to shared categories, opt-in shared milestones, "send a little something" gesture notes from preset prompts plus free text.

## Predictions (Phase 1 statistics)

- Next period from a recency-weighted average of the last 3–6 cycles.
- Ovulation ≈ next period − 14 days with a variance band; fertile window derived from it.
- Confidence band width from the standard deviation of her cycle lengths, rendered as the soft edge fade rather than a hard line.
- Symptom patterns as historical frequency statements ("of your last 8 luteal phases, cramps were logged in 6"), never a claim about how she will feel.

## Technical approach

- Lovable Cloud (Postgres + Auth) for accounts and data.
- Tables: `profiles`, `cycles`, `day_logs` (flow, symptoms, mood, notes, advanced fields), `partner_links` (with per-category sharing flags and status), `partner_notes`.
- Row-level security is the enforcement layer: her own rows are readable only by her; a linked partner reads through a security-definer function that checks the link status and the specific category flag, so revoking a toggle cuts access at the database, not in the client.
- Prediction math lives in a pure client module so it runs offline and is unit-testable.
- App lock: passcode with optional device passkey (WebAuthn), guarding the app shell on resume.
- Empty, error, offline, permission-denied and loading states each get their own mascot + copy; loading uses the distracted mascot after ~1s.

## Not in this build

Screenshot/OCR import, on-device ML Phase 2/3 models, push notifications to a second device (partner nudges appear as in-app cards), and native app packaging.
