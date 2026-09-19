# Laali (लाली) — A Cycle Tracker Built for Two

A private, mobile-first cycle tracker with a warm, handcrafted visual language, accompanied by an intentional partner mode that only ever reveals what is explicitly shared.

---

## Overview

Most cycle trackers are either hyper-clinical spreadsheets or generic apps covered in pink gradients and corporate stock emojis. **Laali** is designed with a different ethos:

- **Organic & Human**: Built with a warm cream and ink palette, custom Lora serif typography, wobbly hand-drawn SVG cycle arcs, and seven distinct mascot emotional states instead of generic emojis.
- **Statistically Honest**: Cycle predictions adapt over time and visibly display confidence bands rather than giving false precision.
- **Private by Default**: Her health data belongs entirely to her. If she invites a partner, she decides precisely what categories they can see (phase, mood, symptoms, milestones) with one-tap instant revocation enforced directly at the database layer.
- **Empathetic Partner Experience**: A dedicated partner section (`/partner`) with its own calming sage palette. It provides actionable, thoughtful context based strictly on what she logged—never assuming, infantilizing, or turning health tracking into surveillance.

---

## Key Features

### Her App Experience

- **Organic Four-Phase Cycle Ring**:
  - Dynamically renders the four phases: **Menstrual** (dusty rose), **Follicular** (apricot), **Ovulation** (warm marigold), and **Luteal** (soft mauve).
  - Procedurally generated SVG arc with organic noise jitter and spring animation on load.
  - Soft edge fading reflecting statistical prediction confidence.
  - Interactive day dots showing logged days and current cycle day.
- **Daily Quick-Log Flow**:
  - Bottom sheet interface for rapid logging in seconds.
  - Flow intensity tracking (*spotting*, *light*, *medium*, *heavy*).
  - Multi-select symptom chips (*cramps*, *headache*, *bloating*, *backache*, etc.).
  - Mood check-ins (*calm*, *happy*, *energetic*, *sensitive*, *irritable*, *anxious*, etc.).
  - Optional advanced tracking behind an explicit toggle: Basal Body Temperature (BBT), cervical mucus, and medications.
  - Custom notes with mascot reaction states.
- **Calendar & History**:
  - Month grid view color-coded by cycle phase.
  - Horizontal swipeable cycle history timeline cards.
  - Symptom filtering to analyze frequency across previous cycles.
- **Insights & Trend Analytics**:
  - Cycle length variability trends visualized with organic lines.
  - Historical symptom recurrence ("cramps logged in 6 of your last 8 luteal phases").
  - Clear prediction confidence explanations.
  - Exportable, printable summary for healthcare consultations.
- **Educational Library & Self-Care**:
  - Phase-by-phase biological guides.
  - Bite-sized illustrated cards and tailored self-care suggestions.
- **Custom Mascot Companion**:
  - Seven reactive emotional states: *Celebratory*, *Energetic*, *Comforted*, *Neutral*, *Tired*, *Sleepy*, and *Distracted*.
  - Configurable mascot naming during onboarding.
- **Privacy & Security**:
  - Passcode protection with optional device passkey (WebAuthn).
  - Reduced-motion toggle (`calm-motion`) respecting user preferences.

### Partner Experience (`/partner`)

- **Independent Experience**:
  - Separate interface styled in a muted sage and warm charcoal theme.
  - Separate navigation and dedicated routes.
- **Granular Consent & Sharing**:
  - She generates an invite code and specifies what categories to share:
    - Current Phase
    - Mood
    - Symptoms
    - Shared Milestones
  - One-tap revocation immediately terminates access at the database level without awkward notifications.
- **Contextual Guidance**:
  - Explains the current cycle phase and what biological shifts are occurring.
  - Actionable suggestions and care tips derived solely from actual logged data.
  - Gesture notes: Send preset support notes or custom encouragement.

---

## Tech Stack & Architecture

- **Full-Stack Framework**: [TanStack Start](https://tanstack.com/start) (React 19, Nitro server engine, Vite 8)
- **Routing**: [TanStack Router](https://tanstack.com/router) with typed, file-based routing in `src/routes`
- **State & Data Fetching**: [TanStack React Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with `@tailwindcss/vite`
- **UI Components**: [Radix UI](https://www.radix-ui.com) primitives, [Lucide React](https://lucide.dev) icons, Sonner toast notifications
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Row-Level Security, Auth, RPC functions)
- **Forms & Validation**: React Hook Form, Zod

---

## Design System & Tokens

Laali uses an intentional low-saturation, skin-adjacent OKLCH color palette:

| Token | Hex Equivalent | Description | Usage |
| :--- | :--- | :--- | :--- |
| `--cream` | `#FBF3E8` | Warm cream background | Main app background |
| `--shell` | `#FDF9F3` | Slightly lighter container tint | Cards and elevated sheets |
| `--ink` | `#3A322E` | Warm charcoal | Primary typography and borders |
| `--rose` | `#E8879E` | Dusty rose | Menstrual phase, bleed days |
| `--apricot` | `#F3C89A` | Soft apricot | Follicular phase |
| `--marigold` | `#E8A33D` | Warm marigold | Ovulation phase & fertile window |
| `--mauve` | `#B99BC4` | Soft mauve | Luteal phase |
| `--sage` | `#A9BCA0` | Muted sage | Partner section and support states |

---

## Database Schema & Security Model

Row-Level Security (RLS) is strictly enforced on all tables. Partner access is gated by PostgreSQL security-definer functions, ensuring that sensitive data cannot be retrieved through client manipulations:

```
                  ┌─────────────────┐
                  │   auth.users    │
                  └────────┬────────┘
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
         ▼                 ▼                  ▼
  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
  │  profiles   │   │   cycles    │   │   day_logs   │
  └─────────────┘   └─────────────┘   └──────┬───────┘
                                             │ (RLS: partner_can_see)
                                             ▼
                                    ┌──────────────────┐
                                    │  partner_links   │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │  partner_notes   │
                                    └──────────────────┘
```

- **`profiles`**: User details, display name, custom mascot name, average cycle length, luteal length, and app preferences.
- **`cycles`**: Historical and ongoing cycle boundaries (`period_start`, `period_end`).
- **`day_logs`**: Daily logs (`flow`, `symptoms`, `moods`, `note`, `bbt`, `mucus`, `medications`).
- **`partner_links`**: Relationship between owner and partner, invite codes, connection status, and granular permission flags (`share_phase`, `share_mood`, `share_symptoms`, `share_milestones`).
- **`partner_notes`**: In-app messages and care gestures exchanged between partners.
- **`partner_can_see(_owner, _viewer, _category)`**: Security-definer SQL function checking active link status and category-specific consent before allowing any partner read query.

---

## Project Structure

```
laalii/
├── public/                     # Static assets and favicons
├── src/
│   ├── assets/                 # Mascot expressions and brand marks
│   ├── components/
│   │   ├── ui/                 # Radix UI and styled components
│   │   ├── AppShell.tsx        # Responsive navigation and layout frame
│   │   ├── CycleRing.tsx       # Handcrafted SVG organic cycle visualization
│   │   ├── LogSheet.tsx        # Daily symptom/mood logging drawer
│   │   ├── Mascot.tsx          # Expressive state-driven mascot component
│   │   └── CardDeck.tsx        # Swipeable educational and recap cards
│   ├── hooks/                  # Responsive hooks and interaction utilities
│   ├── integrations/
│   │   └── supabase/           # Supabase client, auth helpers, generated types
│   ├── lib/
│   │   ├── cycle.ts            # Cycle math, predictions, phase segmentation
│   │   ├── insights.ts         # Symptom frequency, trends, doctor export
│   │   ├── data.ts             # React Query hooks for Supabase operations
│   │   ├── routing.ts          # Auth routing and destination resolution
│   │   └── learn-content.ts    # Curated phase education articles
│   ├── routes/                 # File-based TanStack Start routes
│   │   ├── index.tsx           # Landing and welcome screen
│   │   ├── auth.tsx            # Sign in / sign up with email OTP
│   │   ├── reset-password.tsx  # Password recovery flow
│   │   └── _authenticated/     # Authenticated route tree
│   │       ├── home.tsx        # Main cycle ring & daily overview
│   │       ├── calendar.tsx    # Calendar grid & timeline history
│   │       ├── insights.tsx    # Trends, recurrence stats & doctor summary
│   │       ├── learn.tsx       # Phase guide and self-care cards
│   │       ├── settings.tsx    # Cycle overrides, privacy lock, partner invite
│   │       ├── onboarding.tsx  # Initial onboarding & history import
│   │       └── partner/        # Partner view (home, insights, settings)
│   ├── styles.css              # Tailwind CSS v4 styling & color definitions
│   └── router.tsx              # TanStack Router instance configuration
├── supabase/
│   ├── migrations/             # SQL schemas, RLS policies, and functions
│   └── config.toml             # Supabase configuration
├── package.json
└── vite.config.ts              # TanStack Start Vite configuration
```

---

## Getting Started

### Prerequisites

- **Node.js**: v20+ (v22+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prathameshfuke/laalii.git
   cd laalii
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory (or copy from your Supabase project settings):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:3000`.

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Dev** | `npm run dev` | Starts the TanStack Start development server with HMR |
| **Build** | `npm run build` | Builds client and server bundles for production |
| **Preview** | `npm run preview` | Previews the production build locally |
| **Lint** | `npm run lint` | Runs ESLint across the codebase |
| **Format** | `npm run format` | Formats source files using Prettier |

---

## License

This project is private and proprietary. All rights reserved.
