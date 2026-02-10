# gentle_loop — Implementation Handoff

**Date:** 2026-02-09
**Status:** Ready for Implementation (per Implementation Readiness Report)
**Prepared for:** Developer Agent / Implementation Team

---

## Project Summary

**gentle_loop** is a React Native (Expo) mobile app for dementia family caregivers. It provides a calming anchor experience and AI-powered situational guidance through voice interaction.

The core loop: Open app → See anchor image → Hold mic → Describe situation → Get short, actionable AI suggestion → Save what works to personal Toolbox.

**Target:** iOS + Android via Expo/EAS Build. No backend except a single Supabase Edge Function (API proxy).

---

## Planning Artifacts (All in `_bmad-output/planning-artifacts/`)

| Document | Purpose | Key Sections |
|---|---|---|
| `prd.md` | Product requirements | 46 FRs, 18 NFRs, user journeys, compliance |
| `technical-architecture.md` | Architecture, code patterns, pseudocode | Stack, stores, API, components, tests |
| `epics.md` | 5 epics, 25 stories with detailed ACs | FR coverage map, all acceptance criteria |
| `ux-design-specification.md` | Visual design, interaction states, accessibility | 6 states + card variants, Settings layout |
| `ai-system-prompt-production.md` | LLM system prompt + technical notes | Response tagging, energy routing, conversation flow |
| `ai-system-prompt-spec.md` | AI behavior specification | Knowledge base taxonomy, safety guardrails |
| `wireframes-specification.md` | Screen wireframes | ASCII wireframes for all screens |
| `content-final.md` | Affirmation pools, curated ideas content | Text content for offline and encouragement |
| `implementation-readiness-report-2026-02-09.md` | Readiness assessment | 100% FR coverage, 0 critical issues |

---

## Technical Stack

| Layer | Technology | Version Note |
|---|---|---|
| Framework | React Native (Expo) | Latest Expo SDK |
| Language | TypeScript | Strict mode |
| Navigation | Expo Router | File-based routing |
| UI Library | React Native Paper | gentle_loop theme |
| State Management | Zustand | With persist middleware |
| Local Storage | MMKV | Encrypted at rest |
| Animations | react-native-reanimated | 60fps target |
| Image Loading | expo-image | Memory-disk caching |
| Audio Recording | expo-av | 60s max, warm-up handling |
| TTS | expo-speech | Calm voice, adjustable speed |
| Networking | fetch + netinfo | @react-native-community/netinfo |
| API Proxy | Supabase Edge Function | Deno runtime |
| LLM | OpenAI (gpt-4o-mini recommended) | Via API proxy only |
| Build | EAS Build | dev/preview/production profiles |

---

## Architecture Decisions (Critical for Implementation)

1. **Local-first, no auth:** All data in MMKV. No user accounts. No cloud sync.
2. **API key never in client:** LLM API key and system prompt live in Supabase Edge Function env vars.
3. **response_type metadata:** The LLM prepends `[SUGGESTION]`, `[PAUSE]`, `[QUESTION]`, or `[OUT_OF_IDEAS]` to every response. The proxy strips the tag and returns `response_type` field. Fallback: default to `"suggestion"` if tag missing.
4. **Energy slider is 3 discrete snap positions:** "running_low", "holding_steady", "ive_got_this". No continuous values.
5. **Toolbox cap:** 50 entries in MMKV. AI context sends only 15 most recent. FIFO when full. Warning at 45.
6. **Conversation state is in-memory only:** Zustand store, not persisted. App restart = fresh thread.
7. **Conversation truncation:** Keep system prompt + first turn + last 2 turns, drop middle when > 5-7 turns.
8. **Crisis detection (UX-3):** If no interaction for 5+ seconds while card is showing, simplify UI to anchor + pulse only.

---

## Epic & Story Overview

### Epic 1: Core Experience (13 stories — Groups A/B/C)

The complete core product. Build sequentially by group.

**Group A — Foundation (Stories 1.1–1.5):**
- 1.1: STT Provider Evaluation Spike (FIRST — critical path blocker)
- 1.2: Project Setup & Core Infrastructure
- 1.3: Anchor Screen — Image, Affirmation & Mic Button UI
- 1.4: Settings Screen
- 1.5: Offline Detection & Curated Gentle Ideas

**Group B — Voice + AI Pipeline (Stories 1.6–1.8):**
- 1.6: API Proxy Deployment (Supabase Edge Function)
- 1.7: Voice Recording & Transcription
- 1.8: AI Service Client & Suggestion Card (Phase A: service+card, Phase B: actions+threading+crisis)

**Group C — Polish & Integration (Stories 1.9–1.13):**
- 1.9: Text-to-Speech Playback
- 1.10: Text Input Fallback
- 1.11: Swipe-to-Dismiss & Card Transitions
- 1.12: AI-Generated Content Label & Response Mode Wiring
- 1.13: Prompt Quality Validation & Latency Testing

### Epic 2: Onboarding (3 stories) — Required pair with Epic 1
- 2.1: Welcome, How It Works & Your Name
- 2.2: Your Anchor & Meet the Mic
- 2.3: Wellness Disclaimer & First Launch Gate

### Epic 3: Energy Routing & Timer (3 stories)
- 3.1: "Running Low" AI Routing
- 3.2: Breathing Timer with Auto Follow-Up
- 3.3: Active Engagement Override

### Epic 4: Toolbox UI (3 stories)
- 4.1: Full View — Browse All Saved Strategies
- 4.2: Entry Management — Delete Strategies
- 4.3: Integration Testing — AI Behavior Validation

### Epic 5: Smart Conversation Behaviors (3 stories)
- 5.1: "Still With You" Encouragement Messages
- 5.2: Conversation Pivot — AI Asks a Question
- 5.3: "Out of Ideas" Graceful Endpoint

---

## Recommended Sprint Plan

| Sprint | Content | Milestone |
|---|---|---|
| 1 | Epic 1 Group A (Stories 1.1–1.5) | Demoable on device — anchor, settings, offline |
| 2 | Epic 1 Group B (Stories 1.6–1.8) | "It works" — speak → get suggestion |
| 3 | Epic 1 Group C (1.9–1.13) + Epic 2 (2.1–2.3) | Polished core + onboarding — shippable MVP candidate |
| 4 | Epic 3 (3.1–3.3) + Epic 4 (4.1–4.3) | Energy routing + Toolbox UI |
| 5 | Epic 5 (5.1–5.3) | Smart conversations — full feature set |

---

## BMAD Implementation Workflow (How to Use)

The BMAD framework provides a structured implementation pipeline. Here is the sequence:

### Step 1: Sprint Planning (run once)

```
Run workflow: _bmad/bmm/workflows/4-implementation/sprint-planning
```

This generates `sprint-status.yaml` with all 25 stories in `backlog` status.

### Step 2: Create Story (run per story)

```
Run workflow: _bmad/bmm/workflows/4-implementation/create-story
```

This takes the next `backlog` story from sprint-status, enriches it with full context from all planning artifacts (PRD, architecture, UX, previous story learnings), and creates a comprehensive story file in the stories folder. Status moves to `ready-for-dev`.

### Step 3: Dev Story (run per story)

```
Run workflow: _bmad/bmm/workflows/4-implementation/dev-story
```

This picks up the next `ready-for-dev` story and implements it using red-green-refactor cycle. It follows the story's tasks/subtasks exactly, writes tests, and marks the story `review` when complete.

### Step 4: Code Review (run per story)

```
Run workflow: _bmad/bmm/workflows/4-implementation/code-review
```

Best practice: Use a **different LLM** than the one that implemented the story. Reviews code quality, test coverage, and architecture compliance.

### Repeat Steps 2–4 for each story.

### Additional Workflows
- **sprint-status** — Refresh and view current progress
- **correct-course** — Adjust plan if things change
- **retrospective** — After completing an epic

---

## Key Risks & Mitigations (For Dev Awareness)

| Risk | Mitigation | Story |
|---|---|---|
| STT latency too high | Spike first (Story 1.1), 2-day timebox | 1.1 |
| LLM response_type tag missing | Proxy defaults to "suggestion", logs anomaly | 1.6 |
| Story 1.8 is oversized | Split into Phase A (card) + Phase B (actions+threading) | 1.8 |
| Hold-to-talk clips first word | expo-av has 200-300ms warm-up, handle delay | 1.7 |
| Android swipe conflicts with back gesture | Exclude left 20px edge from swipe zone | 1.11 |
| Non-deterministic AI testing | temperature=0, mock response_type for client tests | 4.3, 5.2, 5.3 |

---

## First Story to Implement

**Story 1.1: STT Provider Evaluation Spike**

This is the critical-path first story (WAR-1). It evaluates on-device speech recognition vs. Whisper API with real speech samples. The output determines which STT provider all voice stories build on.

Timebox: 2 days. Output: comparison document with recommendation.

To begin: Run Sprint Planning, then Create Story for 1.1, then Dev Story.

---

## Quick Reference: File Locations

```
_bmad-output/
  planning-artifacts/
    prd.md                          # Product requirements
    technical-architecture.md       # Architecture + pseudocode
    epics.md                        # All stories + acceptance criteria
    ux-design-specification.md      # Visual design + interactions
    ai-system-prompt-production.md  # LLM system prompt
    ai-system-prompt-spec.md        # AI behavior specification
    content-final.md                # Affirmations + curated ideas
    wireframes-specification.md     # Screen wireframes
    implementation-readiness-report-2026-02-09.md  # Readiness assessment
    implementation-handoff.md       # THIS FILE
  implementation-artifacts/         # Story files will go here
    stories/                        # Created by create-story workflow
    sprint-status.yaml              # Created by sprint-planning workflow
```
