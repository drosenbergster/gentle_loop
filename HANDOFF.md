# Gentle Loop - Development Handoff

**Date:** February 5, 2026  
**Status:** MVP Anchor Screen Complete  
**Repository:** https://github.com/drosenbergster/gentle_loop

---

## Project Overview

**Gentle Loop** is a mobile app for family caregivers of individuals with dementia. It focuses on reducing caregiver stress through emotional regulation with a zero-friction experience.

### Core Philosophy
- **No guilt** - Permissive interface, never judgmental
- **Zero friction** - One-tap interactions, immediate access
- **Caregiver-centered** - Validates feelings before offering guidance

---

## What's Been Built

### Planning & Design (Complete)
All documents in `_bmad-output/planning-artifacts/`:

| Document | Purpose |
|----------|---------|
| `prd.md` | Product Requirements Document |
| `ux-design-specification.md` | UX design details, Ideas framework |
| `wireframes-specification.md` | Screen-by-screen layouts |
| `technical-architecture.md` | Tech stack, architecture decisions |
| `content-final.md` | All 16 ideas, 20 affirmations, copy |
| `ux-design-directions.html` | Interactive HTML mockup |

### App Code
Located in `app/` directory:

```
app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (fonts, providers) ✅
│   ├── index.tsx           # Anchor Screen ✅
│   ├── settings.tsx        # Settings screen ✅
│   └── onboarding/         # Onboarding flow ✅
│       ├── index.tsx       # Welcome screen
│       ├── how-it-works.tsx
│       ├── your-name.tsx
│       └── your-anchor.tsx
├── src/
│   ├── components/
│   │   ├── EnergySlider.tsx    # Vertical gradient slider ✅
│   │   └── IdeasOverlay.tsx    # Ideas card modal ✅
│   ├── data/
│   │   ├── ideas.ts            # 16 ideas by energy level ✅
│   │   └── affirmations.ts     # 25 rotating messages ✅
│   ├── stores/
│   │   ├── energyStore.ts      # Energy state (Zustand) ✅
│   │   └── settingsStore.ts    # Persisted settings (MMKV) ✅
│   ├── hooks/
│   │   └── useAccessibility.ts # Font scaling & contrast ✅
│   └── theme/
│       ├── colors.ts           # Sunset gradient palette ✅
│       ├── typography.ts       # Poppins font system ✅
│       └── spacing.ts          # Layout tokens ✅
└── assets/images/              # Default anchor images ✅
```

---

## Current State

### Working Features

| Feature | Status | Notes |
|---------|--------|-------|
| Anchor Screen | ✅ Complete | Main entry point |
| Anchor Image | ✅ Complete | Mountains default, with breathing pulse |
| Onboarding Flow | ✅ Complete | 4 screens: Welcome, How It Works, Name, Anchor |
| Settings Screen | ✅ Complete | Name, anchor image, accessibility, about |
| Affirmations | ✅ Complete | 20 messages, matched to energy |
| Energy Slider | ✅ Complete | Vertical sunset gradient |
| Ideas Button | ✅ Complete | "Gentle ideas" button |
| Ideas Overlay | ✅ Complete | Validation + title + content |
| Theme System | ✅ Complete | Colors, typography, spacing |
| State Management | ✅ Complete | Zustand + MMKV persistence |
| Web Compatibility | ✅ Complete | Shadows, images, haptics guarded |

### Not Yet Built

| Feature | Priority | Notes |
|---------|----------|-------|
| Onboarding Flow | ✅ Complete | 4 screens: Welcome, How it works, Name, Anchor |
| Settings Screen | ✅ Complete | Change anchor image, accessibility options |
| AI Guided Support | High | Voice input + AI-powered situational responses |
| Toolbox | High | Personal collection of strategies that worked |
| Text-to-Speech | High | AI responses read aloud (configurable) |
| API Proxy | High | Edge function to secure AI API key |
| Custom Images | ✅ Complete | Upload own anchor photos (in Settings) |
| Crisis Detection | Low | Simplify UI after 5s inactivity |

---

## How to Run

### Prerequisites
- Node.js 18+
- Expo Go app on phone (for mobile testing)

### Commands

```bash
# Navigate to app directory
cd app

# Install dependencies (if needed)
npm install

# Start development server
npx expo start

# For web preview
npx expo start --web
```

### Testing Options

1. **Web Browser:** Open http://localhost:8081 (best at 390×844 viewport)
2. **Expo Go (iOS):** Scan QR code with Camera app
3. **Expo Go (Android):** Scan QR code with Expo Go app

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Navigation | Expo Router |
| State | Zustand |
| Persistence | MMKV |
| Styling | React Native Paper + Custom Theme |
| Animations | React Native Reanimated |
| Fonts | Poppins (Google Fonts) |

---

## Design System

### Colors (Sunset Gradient)
```
Twilight Purple: #6B5B7A  (low energy / "Running low")
Dusty Rose:      #C4A4AC  (medium energy / "Holding steady")
Golden Amber:    #E8B87D  (high energy / "I've got this")
Warm Cream:      #FFFBF5  (background)
```

### Typography
- **Font:** Poppins (Light, Regular, Medium, SemiBold)
- **Sizes:** 12px (caption) to 40px (display)
- **Affirmations:** 20px Poppins Light

### Spacing
- **Base unit:** 4px
- **Screen padding:** 24px
- **Card padding:** 20px

---

## Ideas Framework

### Energy States
| Slider Range | User-Facing Label | What Helps |
|--------------|-------------------|------------|
| 0-33% | "Running low" | Permission, settling, self-care |
| 33-66% | "Holding steady" | Practical tools for the moment |
| 66-100% | "I've got this" | Setting up for success |

### Idea Card Format
1. **Validation** (italic) - Acknowledges where they are
2. **Title** (bold) - A gentle prompt
3. **Content** (regular) - Conversational, actionable
4. **Actions** - "Something else" / "That helps"

---

## Key Files to Know

### For Adding Features
- `app/app/index.tsx` - Main Anchor Screen
- `app/src/components/` - Reusable components
- `app/src/data/ideas.ts` - Add more ideas here
- `app/src/data/affirmations.ts` - Add more affirmations here

### For Styling
- `app/src/theme/colors.ts` - Color palette
- `app/src/theme/typography.ts` - Font styles
- `app/src/theme/spacing.ts` - Layout tokens

### For State
- `app/src/stores/energyStore.ts` - Current energy level
- `app/src/stores/settingsStore.ts` - User preferences (persisted)

---

## Known Issues

### Non-blocking
- **Deprecation warnings** from react-native-paper and reanimated (library issues)
- **Energy slider drag on web** limited due to gesture handler web support
- **Haptics** only work on native (guarded for web)

### To Monitor
- `react-native-worklets` version mismatch warning (works despite warning)

---

## Next Steps (Recommended Order)

1. **AI Guided Support** (Voice-First Interaction)
   - Hold-to-talk mic button on Anchor Screen
   - Speech-to-text transcription
   - AI-powered contextual response based on energy level + situation
   - Sequential suggestion cards (swipe for next)
   - "That helped" saves to Toolbox

2. **Toolbox** (Personal Strategy Playbook)
   - Section in Settings screen
   - Collection of AI suggestions marked as helpful
   - Local storage via MMKV

3. **Text-to-Speech Output**
   - AI responses read aloud (configurable in Settings)

4. **API Proxy**
   - Edge function to secure AI API key
   - Route all LLM calls through proxy

5. **Test on Real Device**
   - Build with `eas build` for TestFlight
   - Apple Developer account needed ($99/year)

---

## Content Assets

### Default Anchor Images
Located in `app/assets/images/`:
- `mountains.jpg` - Mountain range with clouds (default)
- `water.jpg` - Calm lake reflection
- `sunset.jpg` - Golden hour sky

### App Icon
- Placeholder SVG at `assets/app-icon.svg`
- Needs proper icon design for production

---

## Git History

```
ca20312 Fix web compatibility issues
a000472 Add Gentle Loop mobile app (Expo/React Native)
a1cb3ba Initial commit: Planning artifacts and research
```

---

## Resources

### Documentation
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [MMKV](https://github.com/mrousavy/react-native-mmkv)

### Research (in repo root)
- `caregiving_tools_strategies_dementia.md`
- `competitor_analysis_daa_apps.md`
- `dementia_engagement_app_summary.md`
- `person_centered_dementia_care.md`

---

## Contact / Questions

This project was scaffolded with the BMAD workflow. Planning artifacts in `_bmad-output/` contain detailed rationale for design decisions.

For questions about:
- **UX decisions** → See `ux-design-specification.md`
- **Ideas content** → See `content-final.md`
- **Technical choices** → See `technical-architecture.md`
