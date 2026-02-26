# Gentle Loop

A mobile app for family caregivers of individuals with dementia. Voice-first AI guidance for stressful moments, with zero friction.

## What It Does

- **Hold-to-talk** — describe what's happening and get an AI-powered suggestion tailored to your energy level and situation
- **Toolbox** — save strategies that work and build a personal playbook over time
- **Offline mode** — curated gentle ideas available without a network connection
- **Crisis awareness** — recognizes urgent situations and surfaces emergency resources
- **Breathing timer** — guided pause when energy is low

## Quick Start

```bash
cd app
npm install
npx expo start
```

Test on [Expo Go](https://expo.dev/go) (iOS/Android) or web at `http://localhost:8081` (best at 390x844 viewport).

### Environment

The app talks to a Supabase Edge Function that proxies AI requests. For local development, the default dev URL is used automatically. For production builds, set environment variables via `eas.json` or `.env`:

```
EXPO_PUBLIC_API_PROXY_URL=https://<your-project>.supabase.co/functions/v1
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

See `app/.env.example` for reference.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State | Zustand + MMKV persistence |
| UI | React Native Paper + custom theme |
| Animations | React Native Reanimated |
| Voice | expo-speech-recognition (on-device STT) |
| AI Backend | Supabase Edge Function → Anthropic Claude 3.5 Haiku |

## Project Structure

```
gentle_loop/
├── app/                        # React Native app (Expo)
│   ├── app/                    # Screens (Expo Router file-based routing)
│   │   ├── index.tsx           # Anchor screen (main interface)
│   │   ├── onboarding.tsx      # 5-step onboarding flow
│   │   ├── settings.tsx        # Settings & preferences
│   │   └── toolbox.tsx         # Saved strategies
│   └── src/
│       ├── components/         # UI components
│       ├── stores/             # Zustand state (settings, energy, toolbox, conversation)
│       ├── services/           # AI client
│       ├── hooks/              # Voice recording, TTS, network status, accessibility
│       ├── data/               # Affirmations, ideas, encouragements, crisis resources
│       └── theme/              # Colors, typography, spacing
├── supabase/
│   └── functions/ai-suggest/   # Edge function (Anthropic proxy + rate limiting)
├── docs/                       # Domain research and documentation index
│   └── research/               # Caregiving strategies, competitor analysis, care principles
└── _bmad-output/               # Planning & implementation artifacts
    ├── planning-artifacts/     # PRD, architecture, epics, UX spec, wireframes, AI prompt
    └── implementation-artifacts/ # Sprint status, story files with dev notes
```

## Documentation

- **[docs/](docs/README.md)** — Documentation index, domain research
- **[PRD](_bmad-output/planning-artifacts/prd.md)** — Product requirements (46 FRs, 18 NFRs)
- **[Technical Architecture](_bmad-output/planning-artifacts/technical-architecture.md)** — Stack, data model, component design
- **[Epics & Stories](_bmad-output/planning-artifacts/epics.md)** — 5 epics, 25 stories
- **[Sprint Status](_bmad-output/implementation-artifacts/sprint-status.yaml)** — Current progress

## Current Status

**MVP complete** — all 5 epics (25 stories) implemented and reviewed. See [sprint status](_bmad-output/implementation-artifacts/sprint-status.yaml) for details.

### Open Items

- TTS playback needs stabilization (wired but not production-ready)
- On-device STT recommendation pending real device validation
- AI feedback quality improvements in progress (more specific responses, crisis escalation tiers)
- SuggestionCard scrollable text fix (in progress)

## Design

### Colors (Sunset Gradient)

| Color | Hex | Usage |
|-------|-----|-------|
| Twilight Purple | `#6B5B7A` | Low energy / "Running low" |
| Dusty Rose | `#C4A4AC` | Medium energy / "Holding steady" |
| Golden Amber | `#E8B87D` | High energy / "I've got this" |
| Warm Cream | `#FFFBF5` | Background |

### Typography

Poppins (Light, Regular, Medium, SemiBold) — sizes from 12px to 40px.
