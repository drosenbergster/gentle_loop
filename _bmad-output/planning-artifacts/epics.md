---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['prd.md', 'technical-architecture.md', 'ux-design-specification.md', 'wireframes-specification.md', 'ai-system-prompt-production.md']
---

# gentle_loop - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for gentle_loop, decomposing the requirements from the PRD, UX Design, Architecture, and AI System Prompt Production into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Caregiver can open the app and immediately see an "Anchor Screen" showing their chosen photo, a rotating affirmation, and a mic button. No other interactive elements on this screen.
FR2: Affirmations rotate and adapt based on the caregiver's energy level (set in Settings).
FR3: Caregiver can set their energy level using a 3-position discrete slider that snaps to "Running low" / "Holding steady" / "I've got this" in the Settings screen. No intermediate values are produced.
FR4: The energy level persists across sessions and is sent as context with every AI request.
FR5: Caregiver can hold a mic button on the Anchor Screen to record a voice description of their current situation. Hold-to-talk: finger down = recording, finger up = stop and send.
FR6: During recording, a pulsing microphone icon is overlaid on the Anchor Screen. The anchor image remains visible underneath. Maximum recording time: 60 seconds.
FR7: Voice audio is transcribed to text (on-device or via API). The audio is immediately discarded after transcription.
FR8: After transcription, a pulsing ellipses (...) overlay indicates the AI is processing.
FR9: The transcribed text and current energy level are sent to an AI backend, which returns a contextual suggestion (~40 words).
FR10: The AI suggestion is displayed on screen as a card AND optionally read aloud via text-to-speech.
FR11: The suggestion card displays four action buttons: "That worked" (save to Toolbox), "Dismiss" (clear card), "Another" (cycle suggestion), Mic button (hold for follow-up).
FR12: Swiping the suggestion card left-to-right dismisses it (same as tapping Dismiss).
FR13: Caregiver can type a situation description as an alternative to voice input.
FR14: When energy is "Running low," the AI's first response leads with permission to pause and a 1-2 minute breathing/stepping-away suggestion.
FR15: After the breathing suggestion, the app starts a timer (1-2 minutes). When the timer expires, the app proactively displays a practical follow-up suggestion without the caregiver needing to ask.
FR16: When energy is "Holding steady" or "I've got this," the AI gives a practical, actionable suggestion immediately with no preamble.
FR17: If the caregiver is actively engaging (tapping "Another," speaking follow-ups), the AI responds immediately regardless of energy state. The timer only applies when the AI explicitly suggests a pause.
FR18: After 2+ suggestion cycles without the caregiver tapping "That worked," the app displays an encouraging meta-message before the next suggestion.
FR19: All interventions suggested by the AI should be achievable in 1-2 minutes.
FR20: The Toolbox is accessible from the Settings screen, keeping the Anchor Screen focused and uncluttered.
FR21: The Toolbox displays all strategies previously marked as "That worked."
FR22: Each Toolbox entry includes the suggestion text and the date it was saved.
FR23: Toolbox data is stored locally on the device only (MMKV). No cloud sync in MVP.
FR24: Caregiver can delete entries from the Toolbox.
FR25: Caregiver can upload or select photos for the Anchor Screen.
FR26: System provides a pre-loaded curated nudge database (16 ideas across energy states) as offline fallback.
FR27: When the device has no internet connection, the mic button appears grayed out on the Anchor Screen.
FR28: Tapping the grayed-out mic button shows a brief message ("AI isn't available offline") and then opens the curated Gentle Ideas overlay.
FR29: Caregiver can complete onboarding in 5 steps: Welcome, How It Works, Your Name, Your Anchor, Meet the Mic.
FR30: The "Meet the Mic" onboarding step introduces the voice feature and requests microphone permission.
FR31: Caregiver must accept a "Wellness Tool, Not Medical Device" disclaimer before first use.
FR32: AI-generated content includes a persistent subtle indicator that responses are AI-generated.
FR33: Caregiver can set their energy level via slider in Settings.
FR34: Caregiver can choose AI response mode: text only, audio only, or both (default: both).
FR35: Caregiver can adjust accessibility settings: reduce motion, larger text, high contrast.
FR36: Caregiver can change their name and anchor image from Settings.
FR37: Toolbox is accessible as a section within the Settings screen.
FR38: All settings persist locally across sessions.
FR39: Voice audio is transcribed and deleted immediately. It is never stored on device or server.
FR40: AI API calls route through a server-side proxy; the API key is never exposed in the client app.
FR41: Caregiver's local data (settings, energy state, Toolbox) persists across app restarts without data loss.
FR42: A conversation thread persists from the first mic press through all follow-up interactions until the caregiver dismisses all cards and returns to the Anchor Screen.
FR43: The AI receives full conversation context within a thread: original situation, energy level, all previous suggestions given, Toolbox entries, and follow-up input. Maximum 5-7 turns per thread.
FR44: After approximately 3-4 suggestions that the caregiver declines, the AI pivots from situation-focused suggestions to caregiver-focused inquiry.
FR45: When the AI has no more novel suggestions, it acknowledges this honestly, redirects the caregiver to their Toolbox, and affirms that their presence matters.
FR46: Toolbox entries are sent as context with every AI request so the AI can reference known-good strategies, avoid redundant suggestions, and learn what types of interventions work for this specific care recipient.

### NonFunctional Requirements

NFR1: The Anchor Screen must load and be interactive within 2 seconds of app launch.
NFR2: Voice transcription must complete within 2 seconds of the caregiver releasing the mic button.
NFR3: AI suggestion must appear on screen within 3 seconds of transcription completing (total voice-to-suggestion: ≤5 seconds).
NFR4: Text-to-speech playback must begin within 1 second of the suggestion appearing on screen.
NFR5: Swiping to the next suggestion must feel instant (<300ms) if the AI has pre-generated alternatives.
NFR6: Timer-based follow-up must fire within 3 seconds of timer expiry (including AI response time).
NFR7: Voice audio must be discarded within 5 seconds of transcription completion.
NFR8: All local data must be encrypted at rest (MMKV encryption).
NFR9: No personally identifiable health data about the care recipient is transmitted to or stored on external servers.
NFR10: AI API key must be secured server-side; the client app must never contain the key directly.
NFR11: All interactive elements must have a minimum tap target of 44x44 points.
NFR12: Text on Anchor Screen and suggestion cards must meet WCAG AA contrast ratio (4.5:1).
NFR13: App must support system-level "Large Text" accessibility settings.
NFR14: The mic button must be large enough to hold comfortably under stress (minimum 64x64 points).
NFR15: Suggestion card action buttons must be large and legible without glasses (minimum 44x44 points each).
NFR16: Text-to-speech output must use a calm, clear voice at adjustable speed.
NFR17: If the AI API is unreachable, the grayed mic button must respond to taps within 1 second, showing the offline message and opening Gentle Ideas.
NFR18: The Anchor Screen, affirmations, and Toolbox must function fully without network connectivity.

### Additional Requirements

**From Technical Architecture:**
- ARCH-1: Project setup with React Native (Expo), TypeScript, Expo Router, React Native Paper
- ARCH-2: Local storage via MMKV with encryption at rest
- ARCH-3: State management via Zustand with persist middleware for settings, energy, and toolbox stores
- ARCH-4: Conversation state managed in-memory via Zustand (not persisted to disk)
- ARCH-5: API proxy via Supabase Edge Function — holds system prompt and LLM API key server-side
- ARCH-6: Speech-to-text via on-device (Apple Speech / Google Speech) or Whisper API — evaluate both
- ARCH-7: Text-to-speech via expo-speech (on-device)
- ARCH-8: Audio recording via expo-av with 60-second max duration
- ARCH-9: AI context built as structured single user message (energy, request_type, toolbox, history, caregiver message)
- ARCH-10: System prompt stored in Edge Function environment variable, not in client bundle
- ARCH-11: "Out of ideas" detection in proxy response metadata
- ARCH-12: Rate limiting on API proxy (per-device, soft cap)
- ARCH-13: Network status detection via @react-native-community/netinfo
- ARCH-14: Image optimization via expo-image with memory-disk caching
- ARCH-15: Animations via react-native-reanimated for 60fps performance
- ARCH-16: Microphone permission description in iOS Info.plist and Android manifest
- ARCH-17: EAS Build configuration for development, preview, and production profiles
- ARCH-18: "Still With You" encouragement message pool stored in client as static data with no-consecutive-repeat selection

**From UX Design Specification:**
- UX-1: Hold-to-talk gesture for mic (finger down = record, finger up = send) — not tap-to-toggle
- UX-2: Anchor image remains visible through all overlay states (recording, processing, suggestion)
- UX-3: Crisis detection: if no interaction for 5+ seconds, UI simplifies to anchor + pulse only
- UX-4: Suggestion card covers max 60% of screen height — anchor presence always visible
- UX-5: "Still With You" encouragement banner displays above suggestion card and auto-fades after 3-4 seconds
- UX-6: Timer/breathing UI uses expanding/contracting circle (4s cycle) with skip option
- UX-7: Swipe left-to-right on suggestion card to dismiss
- UX-8: Reduce Motion mode disables all animations (pulse, recording ring, breathing circle)
- UX-9: All transitions use gentle easing: 400-600ms for major transitions, 300ms for micro-interactions
- UX-10: Text input fallback icon positioned below mic button, visually secondary
- UX-11: Onboarding step 5 includes mic permission request, hold-to-talk demo animation, and disclaimer checkbox
- UX-12: Settings sections ordered: Energy, Toolbox, Personalization, AI Response, Accessibility, About
- UX-13: Toolbox preview in Settings shows 3 most recent entries with "View All" expansion
- UX-14: "Out of Ideas" card hides the "Another" button (removed, not just disabled)
- UX-15: Responsive scaling: mic button 72-88px, anchor image 240-320px depending on screen size
- UX-16: Conversation pivot card variant — when AI asks a question, mic becomes primary action, "That worked" and "Another" are hidden, subtle "Hold the mic to respond" prompt appears (from pre-mortem analysis)

**From Pre-mortem Analysis (applied 2026-02-09):**
- PM-1: STT provider evaluation spike — test on-device vs. Whisper API with real speech samples and measure latency before building voice stories
- PM-2: System prompt quality validation — run 10+ real caregiver scenarios through production prompt, evaluate tone/brevity/safety, iterate prompt before shipping
- PM-3: End-to-end latency testing under cellular conditions (not just Wi-Fi) — acceptance criteria on AI response stories
- PM-4: Toolbox integration testing — verify AI actually changes behavior when Toolbox entries present vs. absent, tested against live LLM
- PM-5: Offline fallback folded into core experience — users with unreliable Wi-Fi hit offline state in week 1, can't be a separate late epic

**From Cross-Functional War Room (applied 2026-02-09):**
- WAR-1: STT provider spike must be the very first story built — it's a critical-path blocker for all voice stories
- WAR-2: API proxy setup needs realistic time budget (2-3 days, not half a day) — Supabase Edge Function + CORS + env vars
- WAR-3: Hold-to-talk has ~200-300ms recording warm-up on expo-av — handle delay so first word isn't clipped
- WAR-4: Epic 1 stories internally sequenced as 3 groups: Group A (Foundation), Group B (Voice+AI Pipeline), Group C (Polish & Integration)
- WAR-5: Epic 2 (Onboarding) is a required pair with Epic 1 for any user-facing release — no real users without onboarding
- WAR-6: Offline idea card should use same visual container/card as AI suggestion card — prevents "two different apps" feeling
- WAR-7: Offline card keeps 2 contextually appropriate actions (Something else / That helps) — no non-functional mic button on a card that exists because mic doesn't work
- WAR-8: Stories within Epic 1 need clear internal milestones: Group A demoable on device, Group B is the "it works" moment

**From Critique and Refine (applied 2026-02-09):**
- CR-1: Thin Toolbox store (data layer only, MMKV persistence) moved into Epic 1 so "That worked" saves from day one. Toolbox Settings UI remains in Epic 4.
- CR-2: API proxy story AC must require system prompt stored as environment variable, not hardcoded — updatable without redeploying the Edge Function
- CR-3: FR32 (AI-generated label) flagged as low-priority within Epic 1 Group C — deferrable if Group C runs long
- CR-4: Progress tracked by story group (A/B/C) within Epic 1, not by epic number
- CR-5: App store submission tasks (metadata, privacy policy URL, mic permission string) added as operational note to Epic 2

**From First Principles Analysis (applied 2026-02-09):**
- FP-1: FR46 (Toolbox entries in AI context) moved from Epic 4 to Epic 1 Group B — it's one field in the context payload and makes the AI personalized from session 2. Epic 4 becomes purely Toolbox UI.
- FP-2: FR42, FR43 (basic conversation threading) moved from Epic 5 to Epic 1 Group B — "Another" button is effectively broken without the AI seeing prior exchanges. Epic 5 becomes purely smart conversation behaviors (encouragement, pivot, out of ideas).
- FP-3: "Running low" energy without timer (Epic 3) works via manual mic follow-up — acceptable known limitation pre-Epic 3. Document, don't change.
- FP-4: Offline mode is a safety net with limited shelf life (~days of heavy use). Awareness note for Phase 2 caching/queuing, no MVP change.

**From Self-Consistency Validation (applied 2026-02-09):**
- SCV-1: API proxy response_type metadata generalized — proxy returns `response_type` field ("suggestion", "pause", "question", "out_of_ideas") instead of separate boolean flags. Consumed by Epic 1 (suggestion), Epic 3 (pause/timer), Epic 5 (question/pivot, out_of_ideas).
- SCV-2: UX-3 (crisis detection: 5+ seconds no interaction → simplify UI) added to Story 1.8 — was missing from all stories.
- SCV-3: NFR9 (no PII about care recipient beyond transcribed text) added as explicit AC on Story 1.6.
- SCV-4: NFR13 (system-level Large Text / Dynamic Type) added to Story 1.4 — distinct from app-level larger text toggle.
- SCV-5: NFR16 TTS speed adjustment added to Story 1.4 (setting) and Story 1.9 (implementation).
- SCV-6: Offline→online transition added to Story 1.5 — mic re-enables when connectivity returns.
- SCV-7: Story 1.12 response mode AC clarified as end-to-end verification, not re-implementation of Story 1.9 logic.
- SCV-8: NFR5 (pre-generated swipe <300ms) noted as Phase 2 only (Option A pre-generation). Not applicable to MVP.
- SCV-9: ARCH-4 (conversation state is in-memory only, not persisted) made explicit in Story 1.8.

**From User Persona Focus Group (applied 2026-02-09):**
- UFG-1: Minimum recording threshold added to Story 1.7 — shaky hands may release early, very short recordings (< 1s) get a friendly re-prompt instead of garbled STT.
- UFG-2: Tap-instead-of-hold error state added to Story 1.7 — if mic is tapped and released < 0.5s, a gentle tooltip explains hold-to-talk gesture.
- UFG-3: Mic button available during/after breathing timer in Story 3.2 — situation may evolve during the 1-2 minute pause.
- UFG-4: STT spike (Story 1.1) expanded to include breathless/rushed speech and background child noise in test samples.
- UFG-5: Text input icon minimum tap target (44x44pt) made explicit in Story 1.10.
- UFG-6: Breathing suggestion framed as optional permission in Story 3.1 — not a command to breathe.
- UFG-7: "Still With You" messages must not include toxic positivity — explicit in Story 5.1.
- UFG-8: New thread after "Out of Ideas" is a fresh start — explicit in Story 5.3.
- UFG-9: Skip option on breathing timer must be prominent, not a small text link — explicit in Story 3.2.
- UFG-10: "Toolbox" terminology comprehension noted for prompt validation testing (Story 1.13).

**From Failure Mode Analysis (applied 2026-02-09):**
- FM-1: `response_type` detection mechanism specified — system prompt instructs LLM to prepend a structured tag (`[SUGGESTION]`, `[PAUSE]`, `[QUESTION]`, `[OUT_OF_IDEAS]`), proxy strips the tag and maps to `response_type` metadata field. Added to Story 1.6.
- FM-2: Story 1.8 flagged as oversized for a single dev agent. Split into two implementation phases (A: service client + card display, B: actions + threading + crisis detection) within the story.
- FM-3: Energy slider clarified as 3 discrete snap positions, not continuous. No intermediate values sent to AI.
- FM-4: Affirmation rotation interval specified: rotate on each app open + every 60 seconds on Anchor Screen.
- FM-5: Swipe gesture must exclude Android system back gesture zone (left 20px edge). Explicit Android testing required.
- FM-6: Conversation history truncation algorithm specified: keep system prompt + first turn + last 2 turns, drop middle turns.
- FM-7: Toolbox 16th entry: oldest entry silently replaced (FIFO) when cap is reached.
- FM-8: Photo library permission (`NSPhotoLibraryUsageDescription`) added to Story 2.2 AC.
- FM-9: Background timer handling: if app resumes with expired timer, fire auto-follow-up immediately on resume.
- FM-10: Offline curated ideas pool exhaustion: cycle restarts with shuffle when all ideas for current energy level have been shown.

**From Comparative Analysis Matrix (applied 2026-02-09):**
- CM-1: Story 4.3 Toolbox testing: temperature=0 for reproducibility, 3 runs per condition, validate by checking explicit Toolbox reference/avoidance.
- CM-2: Story 1.13 prompt validation: scenarios sourced from PRD journeys, structured input format, results in markdown file, 2-of-3 evaluator pass criteria.
- CM-3: Story 1.12 AI label: specified as small muted text label at bottom-left of card, WCAG AA contrast, no overlap with action buttons.
- CM-4: Story 1.8 Phase A/B completion milestones defined (Phase A: speak → see card. Phase B: all actions + threading + crisis detection).
- CM-5: Story 1.4 implementation note: build section-by-section, Energy slider is minimum viable.
- CM-6: Stories 5.2 and 5.3: client-side tests should mock `response_type` to verify UI independently of LLM non-determinism.

**From Socratic Questioning (applied 2026-02-09):**
- SQ-1: response_type tag fallback — if LLM omits or malforms the structured tag, proxy defaults to "suggestion" and logs for monitoring. Prevents silent degradation of Epic 3 and Epic 5 features.
- SQ-2: Energy level is read at request time, not updatable mid-thread. Known limitation documented in Story 1.8. Phase 2 consideration: inline energy check.
- SQ-3: Toolbox cap increased from 15 to 50 entries (storage is negligible for text+date). AI context serialization still sends only 15 most recent. Warn when approaching cap.
- SQ-4: Card variant transitions (standard → pivot → out-of-ideas) rely on card content to carry context. First-time-user testability note added to Stories 5.2 and 5.3.
- SQ-5: Anchor photo onboarding prompt updated to suggest non-person photos (peaceful places, pets, views). Settings makes image swap easy.
- SQ-6: Cold-start scenarios (empty Toolbox, default energy, no history) added to prompt validation (Story 1.13).
- SQ-7: No cross-thread memory in MVP documented as known limitation. Toolbox is the persistence bridge. Phase 2 consideration: lightweight session summary.

### FR Coverage Map

FR1: Epic 1 — Anchor Screen with photo, affirmation, mic button
FR2: Epic 1 — Affirmations rotate and adapt to energy level
FR3: Epic 1 — Energy slider in Settings
FR4: Epic 1 — Energy level persists and sent as AI context
FR5: Epic 1 — Hold-to-talk mic button recording
FR6: Epic 1 — Pulsing mic overlay during recording, anchor visible
FR7: Epic 1 — Voice transcription with immediate audio deletion
FR8: Epic 1 — Pulsing ellipsis processing state
FR9: Epic 1 — Transcription + energy sent to AI, suggestion returned
FR10: Epic 1 — Suggestion displayed as card + optional TTS
FR11: Epic 1 — Suggestion card with 4 action buttons
FR12: Epic 1 — Swipe left-to-right dismisses card
FR13: Epic 1 — Text input fallback for typed descriptions
FR14: Epic 3 — "Running low" → AI leads with permission + breathing
FR15: Epic 3 — Timer starts after breathing suggestion, auto-follow-up on expiry
FR16: Epic 1 — "Holding steady" / "I've got this" → immediate practical suggestion
FR17: Epic 3 — Active engagement overrides timer, AI responds immediately
FR18: Epic 5 — "Still With You" encouragement after 2+ cycles
FR19: Epic 5 — All AI suggestions achievable in 1-2 minutes
FR20: Epic 4 — Toolbox accessible from Settings
FR21: Epic 4 — Toolbox displays all "That worked" strategies
FR22: Epic 4 — Toolbox entries include suggestion text + date saved
FR23: Epic 1 — Toolbox data layer stored locally (MMKV), no cloud sync (thin store for "That worked" saves; UI in Epic 4)
FR24: Epic 4 — Caregiver can delete Toolbox entries
FR25: Epic 1 — Upload or select anchor photos
FR26: Epic 1 — Pre-loaded curated nudge database (16 ideas, offline fallback)
FR27: Epic 1 — Offline: mic button grayed out
FR28: Epic 1 — Offline: tap grayed mic → message → Gentle Ideas overlay
FR29: Epic 2 — 5-step onboarding flow
FR30: Epic 2 — "Meet the Mic" step with mic permission request
FR31: Epic 2 — Wellness disclaimer acceptance before first use
FR32: Epic 1 — AI-generated content has subtle indicator label
FR33: Epic 1 — Energy slider in Settings (same as FR3)
FR34: Epic 1 — Response mode setting: text only, audio only, or both
FR35: Epic 1 — Accessibility settings: reduce motion, larger text, high contrast
FR36: Epic 1 — Change name and anchor image from Settings
FR37: Epic 4 — Toolbox section within Settings (same as FR20)
FR38: Epic 1 — All settings persist locally
FR39: Epic 1 — Voice audio transcribed and deleted immediately
FR40: Epic 1 — API calls route through server-side proxy, key never in client
FR41: Epic 1 — Local data persists across app restarts
FR42: Epic 1 — Conversation thread persists through follow-ups until dismiss (basic threading — context plumbing, not smart behaviors)
FR43: Epic 1 — AI receives full thread context (5-7 turns max) (context plumbing — ensures "Another" doesn't repeat suggestions)
FR44: Epic 5 — AI pivots after ~3-4 declined suggestions
FR45: Epic 5 — "Out of Ideas" honest acknowledgment + Toolbox redirect
FR46: Epic 1 — Toolbox entries sent as AI context for personalization (one field in context payload, enables AI personalization from session 2)

## Epic List

### Epic 1: Core Experience — Anchor Screen, AI Guided Support & Offline Fallback
The complete core product. Caregiver opens the app, sees their calming anchor (photo, affirmation, breathing pulse), holds the mic, speaks, and gets a short AI suggestion with 4 actions. Text input fallback available. TTS reads suggestions aloud. Settings include energy slider, response mode, accessibility, and personalization. When offline, mic grays out and curated Gentle Ideas provide a fallback (using the same card container as AI suggestions for visual consistency). Includes STT provider evaluation spike and system prompt quality validation testing.

**Internal story groups (build sequentially):**
- **Group A — Foundation:** Project setup, theme, storage, Anchor Screen (image + affirmation + mic button UI), Settings, energy store, thin Toolbox store (data layer only — so "That worked" saves from day one), offline detection, curated ideas overlay. Demoable on device.
- **Group B — Voice + AI Pipeline:** STT spike (first!), API proxy deployment, voice recording (with warm-up handling), AI service client, suggestion card with 4 actions, basic conversation threading (thread context persists so "Another" doesn't repeat), Toolbox entries included in AI context payload. The "it works" milestone.
- **Group C — Polish & Integration:** TTS, text input fallback, swipe-to-dismiss, response mode, AI-generated label, prompt quality validation, end-to-end latency testing under cellular.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR16, FR23, FR25, FR26, FR27, FR28, FR32, FR33, FR34, FR35, FR36, FR38, FR39, FR40, FR41, FR42, FR43, FR46
**Pre-mortem additions:** STT provider spike (PM-1), prompt quality validation (PM-2), latency testing under cellular (PM-3)
**War room additions:** STT spike as Story 1.1 (WAR-1), realistic proxy time budget (WAR-2), hold-to-talk warm-up handling (WAR-3), 3 story groups (WAR-4), aligned offline card container (WAR-6, WAR-7)
**Critique additions:** Thin Toolbox store in Group A so "That worked" saves from day one (CR-1), prompt as env var AC on proxy story (CR-2), FR32 deferrable in Group C (CR-3)
**First Principles additions:** Basic conversation threading in Group B (FP-2), Toolbox in AI context payload in Group B (FP-1)

### Epic 2: Onboarding & First-Time Setup
New caregiver completes 5-step onboarding: Welcome, How It Works, Name, Anchor, Meet the Mic. Accepts wellness disclaimer with approachable (not clinical) language. Gets mic permission. Required pair with Epic 1 for any user-facing release. Includes app store operational tasks (metadata, privacy policy URL, mic permission usage string).
**FRs covered:** FR29, FR30, FR31
**War room additions:** Required pair with Epic 1 (WAR-5)
**Critique additions:** App store submission tasks (CR-5)

### Epic 3: Energy-Aware Routing & Timer Flow
When energy is "running low," the AI leads with permission + breathing suggestion, and the app runs a 1-2 minute timer with breathing animation. On expiry, a practical follow-up appears automatically. Skip option available. Active engagement overrides the timer.
**FRs covered:** FR14, FR15, FR17

### Epic 4: Toolbox — Personal Strategy Playbook UI
Toolbox viewable and manageable in Settings. Full Toolbox UI: browse all saved strategies, see dates, delete entries. Toolbox preview with "View All" expansion. Includes integration testing to verify AI actually changes behavior with Toolbox present. (Note: "That worked" saves and Toolbox-in-AI-context are already working from Epic 1.)
**FRs covered:** FR20, FR21, FR22, FR24, FR37
**Pre-mortem additions:** Toolbox integration testing against live LLM (PM-4)
**First Principles note:** FR46 (Toolbox in AI context) and FR23 (Toolbox data layer) moved to Epic 1. This epic is now purely Toolbox UI.

### Epic 5: Smart Conversation Behaviors
Builds on top of basic threading (already in Epic 1). "Still With You" encouragement after 2+ cycles without "That worked." AI pivots to caregiver-focused inquiry after ~3-4 failed suggestions — with adapted card UI (mic primary, suggestion actions hidden). Graceful "Out of Ideas" endpoint with Toolbox redirect. All AI suggestions achievable in 1-2 minutes.
**FRs covered:** FR18, FR19, FR44, FR45
**Pre-mortem additions:** Pivot card variant with adapted UI (UX-16)
**First Principles note:** FR42, FR43 (basic conversation threading) moved to Epic 1 Group B. This epic focuses on higher-order conversation intelligence layered on top of that foundation.

---

## Epic 1: Core Experience — Anchor Screen, AI Guided Support & Offline Fallback

The complete core product. Caregiver opens the app, sees their calming anchor (photo, affirmation, breathing pulse), holds the mic, speaks, and gets a short AI suggestion with 4 actions. Text input fallback available. TTS reads suggestions aloud. Settings include energy slider, response mode, accessibility, and personalization. When offline, mic grays out and curated Gentle Ideas provide a fallback. Includes STT provider evaluation spike, conversation threading, Toolbox in AI context, and system prompt quality validation testing.

**Internal story groups:** Group A (Foundation) → Group B (Voice + AI Pipeline) → Group C (Polish & Integration)

### --- Group A — Foundation ---

### Story 1.1: STT Provider Evaluation Spike

As a developer,
I want to evaluate on-device speech recognition (Apple Speech / Google Speech) versus Whisper API with real speech samples,
So that we make an informed STT provider decision before building voice stories on a critical-path dependency.

**Acceptance Criteria:**

**Given** a set of 10+ recorded speech samples representing real caregiver scenarios (varied accents, background noise, emotional speech, breathless/rushed speech, and samples with background child noise or TV — reflecting realistic home caregiving conditions per UFG-4)
**When** each sample is processed through on-device STT (Apple Speech on iOS, Google Speech on Android) and Whisper API
**Then** a comparison document is produced covering: transcription accuracy (%), latency (ms from audio-end to text-ready), offline capability, platform differences, and cost per request
**And** a clear recommendation is documented with rationale for MVP provider selection
**And** the spike is timeboxed to 2 days maximum

### Story 1.2: Project Setup & Core Infrastructure

As a developer,
I want the project scaffolded with all foundational dependencies, storage, and state management configured,
So that all subsequent stories can build on a stable, consistent foundation.

**Acceptance Criteria:**

**Given** a new Expo project is initialized with TypeScript and Expo Router (file-based routing)
**When** the project is built and run on a simulator/device
**Then** a blank app loads successfully with React Native Paper theme applied (gentle_loop color palette, typography)
**And** MMKV storage is configured with encryption at rest (NFR8)
**And** Zustand stores are created for: settings store (persisted via MMKV), energy store (persisted via MMKV), and Toolbox store (data layer only, persisted via MMKV — thin store for "That worked" saves per CR-1)
**And** the Toolbox store supports: adding an entry (suggestion text + date), listing entries, and deleting an entry — capped at 50 entries (storage is negligible for text+date in MMKV). When approaching the cap (e.g., 45 of 50), the next "That worked" save shows a brief note: "Your Toolbox is getting full. You can manage entries in Settings." When the 51st entry is added, the oldest is replaced (FIFO) (FM-7, SQ-3). Note: AI context serialization sends only the 15 most recent entries regardless of total stored count.
**And** EAS Build configuration exists for development, preview, and production profiles (ARCH-17)
**And** the project structure follows the architecture document's folder conventions

### Story 1.3: Anchor Screen — Image, Affirmation & Mic Button UI

As a caregiver,
I want to open the app and immediately see my chosen photo, a calming affirmation, and a mic button,
So that I feel grounded and know exactly how to get help.

**Acceptance Criteria:**

**Given** the caregiver has completed onboarding and has an anchor image set
**When** the app is opened
**Then** the Anchor Screen loads within 2 seconds (NFR1) showing: the anchor image (240-320px responsive per UX-15), a rotating affirmation, and a centered mic button (72-88px responsive per UX-15)
**And** the affirmation text adapts based on the current energy level (FR2) — rotating from a pool of affirmations matched to the active energy state. Affirmations rotate on each app open and every 60 seconds while the Anchor Screen is displayed (FM-4)
**And** a settings gear icon is available to navigate to the Settings screen
**And** no other interactive elements are present on the Anchor Screen (FR1)
**And** the anchor image uses expo-image with memory-disk caching for instant load (ARCH-14)
**And** a gentle breathing pulse animation plays on the mic button (disabled when Reduce Motion is on per UX-8)
**And** all text meets WCAG AA contrast ratio 4.5:1 (NFR12)

### Story 1.4: Settings Screen

As a caregiver,
I want to adjust my energy level, name, anchor image, response mode, and accessibility preferences in one place,
So that the app adapts to my current state and needs without cluttering the Anchor Screen.

**Acceptance Criteria:**

**Given** the caregiver navigates to the Settings screen from the Anchor Screen
**When** the Settings screen loads
**Then** sections are displayed in order: Energy, Toolbox (placeholder/preview), Personalization, AI Response, Accessibility, About (UX-12)
**And** the Energy section shows a slider that snaps to exactly 3 discrete positions: "Running low," "Holding steady," "I've got this" — no intermediate values are produced or stored (FR3, FR33, FM-3)
**And** changing the energy slider immediately persists the value via MMKV and updates the Zustand energy store (FR4)
**And** the Personalization section allows changing the caregiver's name and anchor image (FR36) — image selection via device photo library. Changing the anchor image should be quick and easy (1-2 taps to picker) since the caregiver may need to swap it depending on their emotional state (SQ-5)
**And** the AI Response section offers a toggle for response mode: text only, audio only, or both (default: both) (FR34)
**And** the Accessibility section includes toggles for: Reduce Motion, Larger Text, and High Contrast (FR35)
**And** the app respects the device's system-level Large Text / Dynamic Type accessibility settings in addition to the app-level larger text toggle (NFR13)
**And** the AI Response section includes a TTS speech speed option (e.g., slower / default / faster) for caregivers who need speech paced differently (NFR16)
**And** all settings persist across app restarts (FR38, FR41)
**And** all interactive elements have minimum 44x44pt tap targets (NFR11)

*Implementation note (CM-5): This story can be built section-by-section within a single work item. Minimum viable: Energy slider + persistence. Then add sections incrementally (Personalization, AI Response, Accessibility, About). The story is complete when all sections are functional.*

### Story 1.5: Offline Detection & Curated Gentle Ideas

As a caregiver,
I want to still get helpful ideas even when I don't have internet,
So that I'm never left with nothing when I need support.

**Acceptance Criteria:**

**Given** the device has no internet connection (detected via @react-native-community/netinfo, ARCH-13)
**When** the caregiver views the Anchor Screen
**Then** the mic button appears grayed out (FR27)
**And** tapping the grayed-out mic shows a brief message ("AI isn't available offline") within 1 second (NFR17) and then opens the Gentle Ideas overlay (FR28)

**Given** the Gentle Ideas overlay is open
**When** the caregiver views it
**Then** a curated idea is displayed from a pre-loaded database of 16 ideas across energy states (FR26), filtered to the current energy level
**And** the idea is displayed using the same visual card container as AI suggestion cards (WAR-6) — preventing a "two different apps" feeling
**And** the card shows two contextually appropriate actions: "Something else" (shows another idea) and "That helps" (saves to Toolbox store) (WAR-7) — no mic button on the offline card
**And** when all curated ideas for the current energy level have been shown, the pool reshuffles and cycles restart so the caregiver always gets an idea on tap (FM-10)
**And** the Anchor Screen, affirmations, and Toolbox data function fully without network connectivity (NFR18)

**Given** the caregiver is viewing the Gentle Ideas overlay and connectivity is restored
**When** the network status changes to online
**Then** the mic button re-enables on the Anchor Screen (no longer grayed out)
**And** the caregiver can dismiss the overlay to return to the now-online Anchor Screen with full voice/AI capability

### --- Group B — Voice + AI Pipeline ---

### Story 1.6: API Proxy Deployment (Supabase Edge Function)

As a developer,
I want a secure server-side proxy that holds the system prompt and LLM API key,
So that sensitive credentials never exist in the client app and the system prompt is updatable without a client release.

**Acceptance Criteria:**

**Given** a Supabase Edge Function is deployed
**When** a valid request is sent with the structured AI context payload (energy, request_type, toolbox, history, caregiver message per ARCH-9)
**Then** the Edge Function constructs the LLM API call using the system prompt (stored as an environment variable, not hardcoded — CR-2, ARCH-10) and the user message, sends it to the configured LLM provider, and returns the AI suggestion in the response
**And** the API key is never exposed in any client-facing response or error message (FR40, NFR10)
**And** CORS is configured to allow requests from the mobile app
**And** per-device rate limiting is enforced with a soft cap (ARCH-12)
**And** the response includes a `response_type` metadata field indicating the nature of the AI's response: "suggestion" (standard), "pause" (breathing/timer-eligible), "question" (pivot inquiry), or "out_of_ideas" (no more novel suggestions) (ARCH-11, SCV-1)
**And** detection mechanism: the system prompt instructs the LLM to prepend a structured tag to every response (e.g., `[SUGGESTION]`, `[PAUSE]`, `[QUESTION]`, `[OUT_OF_IDEAS]`). The proxy parses and strips this tag before returning the clean response text to the client, mapping the tag to the `response_type` metadata field (FM-1)
**And** if the LLM response does not begin with a recognized tag (missing, malformed, or unexpected format), the proxy defaults `response_type` to "suggestion" and logs the raw response for monitoring. The client gracefully handles the default case — the app continues to function with standard suggestion behavior, never crashing or showing raw tags to the caregiver (SQ-1)
**And** no personally identifiable health data about the care recipient is transmitted beyond the transcribed text required for the AI suggestion (NFR9)
**And** error responses return user-friendly messages (not stack traces or API provider errors)
**And** the system prompt can be updated by changing the environment variable without redeploying the Edge Function

### Story 1.7: Voice Recording & Transcription

As a caregiver,
I want to hold the mic button, describe what's happening, and have my words understood,
So that I can get help without typing during a stressful moment.

**Acceptance Criteria:**

**Given** the caregiver is on the Anchor Screen with internet connectivity and mic permission granted
**When** the caregiver presses and holds the mic button
**Then** recording begins after handling the ~200-300ms expo-av warm-up delay (WAR-3) — the first word is not clipped
**And** a pulsing microphone overlay is displayed on screen while the anchor image remains visible underneath (FR6, UX-2)
**And** recording is capped at 60 seconds maximum (ARCH-8)

**Given** the caregiver releases the mic button (or 60 seconds elapse)
**When** recording stops
**Then** the audio is sent to the selected STT provider (per Story 1.1 recommendation) for transcription
**And** transcription completes within 2 seconds of release (NFR2)
**And** the audio is immediately deleted after transcription — never stored on device or server (FR7, FR39, NFR7)
**And** if transcription fails or returns empty, the caregiver sees a friendly error message with option to try again or use text input

**Given** the caregiver taps and releases the mic button in less than 0.5 seconds (a tap, not a hold)
**When** the release is detected
**Then** no recording is sent — instead a gentle tooltip appears: "Hold the mic and talk — let go when you're done" (UFG-2)
**And** the tooltip auto-dismisses after 3 seconds or on any interaction

**Given** the caregiver holds the mic button for less than 1 second and releases
**When** the recording is evaluated
**Then** the recording is discarded and the caregiver sees a friendly prompt: "That was a short one — try holding the mic a bit longer" (UFG-1)
**And** no STT request is sent for very short recordings that would produce garbled or empty transcription

### Story 1.8: AI Service Client & Suggestion Card

*Implementation note: This story is large and should be split into two work items at implementation time (FM-2). **Phase A:** AI service client, processing overlay, context payload, API call, card display, energy routing. **Phase B:** Card action handlers (That worked, Dismiss, Another, Mic follow-up), conversation threading, Toolbox save, crisis detection. **Completion milestones (CM-4):** Phase A is complete when a caregiver can speak, see the processing state, and see a suggestion card with text. Phase B is complete when all 4 action buttons work, threading persists across "Another" taps, and crisis detection activates after 5s inactivity.*

As a caregiver,
I want to speak my situation and quickly see a helpful suggestion I can act on right now,
So that I have practical support in the moment I need it.

**Acceptance Criteria:**

**--- Phase A: Service Client & Card Display ---**

**Given** transcription has completed successfully (from Story 1.7)
**When** the AI request is being processed
**Then** a pulsing ellipsis (...) overlay is displayed while the anchor image remains visible (FR8, UX-2)

**Given** the AI context payload is built
**When** it is sent to the API proxy
**Then** the payload includes: energy level, request_type (initial/another/follow_up), Toolbox entries for personalization (FR46 — so the AI avoids redundancy and references known-good strategies from session 2 onward), conversation history (all prior turns in the thread), and the caregiver's transcribed message (ARCH-9)
**And** the AI suggestion appears on screen within 3 seconds of transcription completing (NFR3)

**Given** the AI suggestion is displayed
**When** the caregiver views the suggestion card
**Then** the card covers max 60% of screen height with the anchor image visible behind it (UX-4)
**And** the card shows 4 action buttons: "That worked" (saves to Toolbox store with date), "Dismiss" (clears card, ends thread), "Another" (sends another request with request_type=another), and a mic button (hold for follow-up with request_type=follow_up) (FR11)
**And** all action buttons are minimum 44x44pt (NFR15)

**--- Phase B: Card Actions, Threading & Crisis Detection ---**

**Given** the caregiver taps "Another" or holds the mic for a follow-up
**When** a new AI request is sent
**Then** the conversation thread persists — the AI receives full context of all prior exchanges in this thread (FR42, FR43) so it does not repeat previous suggestions
**And** the thread supports up to 5-7 turns. When truncation is needed, the algorithm keeps: system prompt + original situation (first turn) + last 2 turns, dropping middle turns (FM-6). Energy level, Toolbox entries, and request_type are always included regardless of truncation.

**Given** the caregiver taps "That worked"
**When** the save action fires
**Then** the suggestion text and current date are stored in the Toolbox via Zustand/MMKV (FR23)
**And** the card is dismissed and the caregiver returns to the Anchor Screen

**Given** the caregiver taps "Dismiss"
**When** the dismiss action fires
**Then** the card is cleared, the conversation thread ends, and the Anchor Screen is fully restored

**Given** the energy level is "Holding steady" or "I've got this"
**When** the AI returns a suggestion
**Then** the suggestion is practical and actionable with no preamble (FR16)

**Given** the suggestion card is displayed and the caregiver does not interact with the app for 5+ seconds
**When** the inactivity threshold is reached
**Then** the UI simplifies to show only the anchor image and a gentle pulse — the suggestion card fades or minimizes to reduce visual noise during a potential crisis moment (UX-3)
**And** any interaction (touch anywhere, mic press, button tap) immediately restores the full suggestion card UI

**Note:** Conversation thread state is managed in-memory via Zustand (ARCH-4) — it is NOT persisted to MMKV. When the app is force-quit or restarted, any active conversation thread is lost and the caregiver starts fresh. This is intentional — conversations are ephemeral by design.

**Known limitation (SQ-2):** Energy level is read from the persisted setting at the start of each AI request. If a caregiver's energy changes during a thread (e.g., crisis escalates from "holding steady" to "running low"), they must update it in Settings and start a new thread for the AI to adjust tone. Phase 2 consideration: inline energy check at thread start, or the AI asking "How are you holding up?" periodically.

**Known limitation (SQ-7):** No cross-thread memory exists in MVP. When a thread ends (dismiss/swipe), all context is lost. The Toolbox is the only persistence bridge — suggestions saved via "That worked" carry forward. Suggestions that were *declined* are forgotten. Phase 2 consideration: a lightweight "session summary" (last 3 situations + outcomes) persisted in MMKV could give the AI cross-thread awareness.

### --- Group C — Polish & Integration ---

### Story 1.9: Text-to-Speech Playback

As a caregiver,
I want suggestions read aloud to me,
So that I can hear the guidance without looking at my phone during a difficult moment.

**Acceptance Criteria:**

**Given** the caregiver's response mode is set to "audio only" or "both" (default)
**When** an AI suggestion card appears on screen
**Then** the suggestion text is read aloud via expo-speech (ARCH-7) within 1 second of the card appearing (NFR4)
**And** the voice is calm and clear (NFR16)
**And** the speech speed respects the TTS speed setting from Settings (slower / default / faster per NFR16)
**And** if the caregiver dismisses the card while TTS is playing, playback stops immediately

**Given** the caregiver's response mode is set to "text only"
**When** an AI suggestion card appears
**Then** no audio playback occurs

### Story 1.10: Text Input Fallback

As a caregiver,
I want to type my situation when I can't use voice,
So that I can still get AI support in quiet environments or when speaking isn't possible.

**Acceptance Criteria:**

**Given** the caregiver is on the Anchor Screen
**When** they tap the keyboard/text input icon positioned below the mic button (visually secondary per UX-10, but minimum 44x44pt tap target per UFG-5)
**Then** a text input field opens where the caregiver can type a description of their situation (FR13)
**And** submitting the text sends it through the same AI pipeline as voice input (same context payload, same suggestion card response)
**And** the text input supports standard keyboard behaviors (autocorrect, paste, multi-line)
**And** the caregiver can dismiss the text input to return to the mic-first Anchor Screen

### Story 1.11: Swipe-to-Dismiss & Card Transitions

As a caregiver,
I want to swipe away a suggestion card quickly,
So that I can return to my anchor without hunting for a button.

**Acceptance Criteria:**

**Given** a suggestion card is displayed on the Anchor Screen
**When** the caregiver swipes the card from left to right
**Then** the card dismisses with the same behavior as tapping the "Dismiss" button — thread ends, Anchor Screen restored (FR12, UX-7)
**And** the swipe gesture region excludes the Android system back gesture zone (approximately left 20px edge) to prevent conflict with OS navigation. Must be tested on Android specifically (FM-5)
**And** all card transitions use gentle easing: 400-600ms for card appear/dismiss, 300ms for button micro-interactions (UX-9)
**And** animations are implemented via react-native-reanimated for 60fps performance (ARCH-15)
**And** when Reduce Motion is enabled, animations are replaced with instant transitions (UX-8)

### Story 1.12: AI-Generated Content Label & Response Mode Wiring

As a caregiver,
I want to know when text on screen is AI-generated,
So that I understand the source of suggestions and maintain appropriate trust.

**Acceptance Criteria:**

**Given** an AI suggestion card is displayed
**When** the caregiver views the card
**Then** a subtle, persistent indicator is visible on the card showing the content is AI-generated (FR32)
**And** the indicator is a small text label (e.g., "AI-generated" or "AI") displayed in muted color at the bottom-left of the suggestion card, sized at the smallest legible font that meets WCAG AA contrast (NFR12). It does not overlap with action buttons or suggestion text (CM-3)

**Given** the caregiver changes their response mode in Settings mid-session
**When** the next AI suggestion is displayed
**Then** the updated setting takes effect immediately — verified end-to-end: "text only" shows card with no audio, "audio only" reads aloud (card still visible for actions), "both" shows card and reads aloud (FR34)

*Note: FR32 (AI-generated label) is deferrable within Group C if timeline is tight (CR-3). Response mode end-to-end verification here complements Story 1.9's TTS implementation — this story confirms mid-session setting changes propagate correctly (SCV-7).*

### Story 1.13: Prompt Quality Validation & Latency Testing

As a developer,
I want to validate the production system prompt with real scenarios and measure end-to-end latency under cellular conditions,
So that we ship an AI experience that is tonally correct, safe, and fast enough for crisis moments.

**Acceptance Criteria:**

**Given** a test suite of 10+ real caregiver scenarios sourced from: PRD user journeys (Journey 1-3), expanded with additional situations from the AI system prompt spec's 17 knowledge base categories — covering all 3 energy levels, various care situations (agitation, sundowning, refusal to eat, wandering, bathing resistance), and edge cases (very short input, emotional venting, off-topic requests) (CM-2)
**When** each scenario is structured as: { situation_text, energy_level, toolbox_entries[], expected_characteristics[] } and run through the full pipeline (text input → API proxy → LLM → response)
**Then** every response is evaluated against: tone (warm, direct, not clinical), brevity (~40 words), safety (no diagnosis, no medication, no judgment), and practical actionability
**And** a scenario passes if 2 out of 3 evaluators (human reviewers or AI-as-judge with rubric) agree it meets all criteria
**And** results are documented in a markdown file in the planning artifacts folder with pass/fail per criterion and prompt iteration notes (CM-2)

**Given** the latency test is run under simulated cellular conditions (3G/4G, not Wi-Fi only)
**When** a voice-to-suggestion request completes
**Then** total elapsed time from mic release to suggestion on screen is measured and documented
**And** the target of ≤5 seconds total (NFR2 + NFR3) is validated or deviations are documented with mitigation plan
**And** at least 3 test runs are conducted under poor-network conditions to check for timeout handling and error recovery

*Note: During prompt validation, also test comprehension of the term "Toolbox" with representative users — elderly caregivers may not immediately understand what "Check your Toolbox" means when the AI says it in the "Out of Ideas" response (UFG-10). Additionally, at least 3 of the 10+ test scenarios must simulate a first-time user: empty Toolbox, default energy level, no conversation history. The AI's response quality must be evaluated specifically for this cold-start condition — the first suggestion must be practical and useful even without personalization context (SQ-6).*

---

## Epic 2: Onboarding & First-Time Setup

New caregiver completes 5-step onboarding: Welcome, How It Works, Name, Anchor, Meet the Mic. Accepts wellness disclaimer with approachable (not clinical) language. Gets mic permission. Required pair with Epic 1 for any user-facing release. Includes app store operational tasks (metadata, privacy policy URL, mic permission usage string).

### Story 2.1: Onboarding Flow — Welcome, How It Works & Your Name

As a new caregiver,
I want a warm, simple introduction to the app that captures my name,
So that I understand what gentle_loop does and the app can address me personally.

**Acceptance Criteria:**

**Given** the caregiver opens the app for the first time (no onboarding completed flag in MMKV)
**When** the app launches
**Then** the onboarding flow begins automatically — the caregiver cannot skip to the main app

**Given** the caregiver is on the Welcome screen (step 1 of 5)
**When** they view the screen
**Then** a warm, brief welcome message introduces gentle_loop's purpose (not clinical, not technical — approachable language)
**And** a progress indicator shows step 1 of 5
**And** a single "Next" button advances to step 2

**Given** the caregiver advances to "How It Works" (step 2 of 5)
**When** they view the screen
**Then** a brief explanation of the mic-first interaction is shown: "Hold the mic, describe what's happening, get one thing to try"
**And** the explanation is visual and concise (illustration or icon + 1-2 sentences, not a wall of text)
**And** "Next" advances to step 3

**Given** the caregiver advances to "Your Name" (step 3 of 5)
**When** they view the screen
**Then** a text input asks for their first name with a friendly prompt (e.g., "What should we call you?")
**And** the name is saved to the settings store (Zustand/MMKV) on advancing
**And** the name field is required — "Next" is disabled until a name is entered
**And** all interactive elements meet 44x44pt minimum tap targets (NFR11)

### Story 2.2: Onboarding Flow — Your Anchor & Meet the Mic

As a new caregiver,
I want to choose my calming photo and learn how the mic works before I need it,
So that my Anchor Screen feels personal and I'm confident using voice input in a crisis.

**Acceptance Criteria:**

**Given** the caregiver advances to "Your Anchor" (step 4 of 5)
**When** they view the screen
**Then** they are prompted to select or upload a photo that brings them calm (FR25) — the prompt should suggest the photo can be anything calming, not just a photo of the care recipient (e.g., a peaceful place, a pet, a favorite view, a family gathering). The app never prescribes what the anchor image "should" be (SQ-5)
**And** photo library permission is requested before presenting the picker — iOS requires `NSPhotoLibraryUsageDescription` in Info.plist, Android requires appropriate storage permission (FM-8)
**And** the device photo library picker is presented for image selection
**And** the selected image is saved and will be used as the Anchor Screen background
**And** a default placeholder image is available if the caregiver wants to skip and choose later

**Given** the caregiver advances to "Meet the Mic" (step 5 of 5)
**When** they view the screen
**Then** a hold-to-talk demo animation shows how the mic gesture works (finger down = record, finger up = send) (UX-11)
**And** the system mic permission dialog is triggered (FR30, ARCH-16) — with a pre-permission explanation of why mic access is needed
**And** if the caregiver denies mic permission, a message explains they can still use text input and can enable mic later in device settings
**And** the demo animation respects the Reduce Motion setting if already configured (UX-8)

### Story 2.3: Wellness Disclaimer & First Launch Gate

As a new caregiver,
I want to understand that this app is a wellness tool (not a medical device) before I start using it,
So that I have appropriate expectations and the app meets regulatory requirements.

**Acceptance Criteria:**

**Given** the caregiver is on the "Meet the Mic" screen (step 5)
**When** they view the disclaimer section
**Then** a wellness disclaimer is displayed with approachable, non-clinical language: "gentle_loop is a wellness companion, not a medical device. It doesn't diagnose, treat, or replace professional care." (FR31)
**And** a checkbox or equivalent acknowledgment control is present — the caregiver must actively accept the disclaimer
**And** the "Get Started" / "Finish" button is disabled until the disclaimer is accepted

**Given** the caregiver accepts the disclaimer and taps "Get Started"
**When** onboarding completes
**Then** an onboarding-completed flag is persisted in MMKV so onboarding is never shown again
**And** the caregiver is navigated to the Anchor Screen (Epic 1)
**And** all onboarding data (name, anchor image, disclaimer acceptance) persists across app restarts (FR38, FR41)

**Given** the caregiver force-quits the app mid-onboarding
**When** they reopen the app
**Then** onboarding resumes from the beginning (no partial state saved — onboarding is short enough to restart)

**Given** the app is being prepared for app store submission
**When** the submission checklist is reviewed
**Then** the following operational items are documented and ready: app store metadata (description, screenshots, category), privacy policy URL, and microphone permission usage string for iOS Info.plist and Android manifest (CR-5, ARCH-16)

*Note: The app store operational items (CR-5) are documented as acceptance criteria here for tracking. The actual submission process happens outside the codebase.*

---

## Epic 3: Energy-Aware Routing & Timer Flow

When energy is "running low," the AI leads with permission + breathing suggestion, and the app runs a 1-2 minute timer with breathing animation. On expiry, a practical follow-up appears automatically. Skip option available. Active engagement overrides the timer.

### Story 3.1: "Running Low" AI Routing — Permission & Breathing Suggestion

As a caregiver who is running low on energy,
I want the AI to first give me permission to pause and suggest a moment to breathe,
So that I feel seen and supported before being asked to try something new.

**Acceptance Criteria:**

**Given** the caregiver's energy level is set to "Running low"
**When** they speak or type a situation and the AI returns its first response in a new thread
**Then** the AI's suggestion leads with permission to pause and includes a 1-2 minute breathing or stepping-away suggestion (FR14)
**And** the breathing/pause is framed as optional permission, not a command — e.g., "You could take a breath first, or tell me more — whatever you need" rather than "You need to breathe before we continue" (UFG-6)
**And** the suggestion is displayed on the standard suggestion card (from Epic 1)
**And** the suggestion card includes the same 4 action buttons ("That worked," "Dismiss," "Another," Mic)

**Given** the caregiver's energy level is "Holding steady" or "I've got this"
**When** they speak or type a situation
**Then** the AI's behavior is unchanged from Epic 1 — immediate practical suggestion with no preamble (FR16)
**And** no timer or breathing flow is triggered

**Given** the AI has returned a breathing/pause suggestion
**When** the response metadata `response_type` is "pause" (from the API proxy, per Story 1.6 / SCV-1)
**Then** the app recognizes this as a timer-eligible response and prepares to start the breathing timer (Story 3.2)

### Story 3.2: Breathing Timer with Auto Follow-Up

As a caregiver who has been told it's okay to pause,
I want a guided breathing moment followed by a practical suggestion that appears automatically,
So that I can take a real break and then get actionable help without needing to ask.

**Acceptance Criteria:**

**Given** the AI has returned a breathing/pause suggestion (from Story 3.1) and the caregiver views the card
**When** the breathing timer activates
**Then** a timer/breathing overlay is displayed with an expanding/contracting circle animation on a 4-second cycle (UX-6)
**And** the timer duration is 1-2 minutes (matching the AI's suggestion)
**And** the anchor image remains visible behind the breathing overlay (UX-2)
**And** a "Skip" option is clearly available and prominently displayed to exit the timer early — not a small text link but a full-sized tappable element, equally weighted with the breathing UI (UX-6, UFG-9)
**And** the mic button remains accessible during the timer — the caregiver can hold the mic at any time to describe a changed situation, cancelling the timer and starting a new voice interaction (UFG-3)
**And** the breathing animation respects Reduce Motion — when enabled, the circle is replaced with a simple countdown or static indicator (UX-8)

**Given** the timer expires (or the caregiver taps "Skip")
**When** the timer ends
**Then** the app automatically sends a `timer_follow_up` request to the AI via the API proxy — no caregiver action required (FR15)
**And** the AI context payload includes: energy level ("running low"), request_type ("timer_follow_up"), full conversation history from the thread, and Toolbox entries
**And** the follow-up suggestion appears within 3 seconds of timer expiry (NFR6)
**And** if the app was backgrounded during the timer and returns after the timer would have expired, the auto-follow-up fires immediately on app resume (FM-9)
**And** the follow-up is a practical, actionable suggestion (not another breathing prompt)
**And** the follow-up is displayed on the standard suggestion card with all 4 action buttons

### Story 3.3: Active Engagement Override

As a caregiver who is running low but ready to act,
I want the app to respond immediately when I engage actively,
So that the timer doesn't slow me down when I need help right now.

**Acceptance Criteria:**

**Given** the caregiver's energy is "Running low" and a breathing/pause suggestion has been displayed
**When** the caregiver taps "Another" on the suggestion card (instead of waiting for the timer)
**Then** the AI responds immediately with a new practical suggestion — the timer is not started or is cancelled if already running (FR17)
**And** the request_type is "another" (not "timer_follow_up")

**Given** the breathing timer is actively counting down
**When** the caregiver holds the mic button to speak a follow-up
**Then** the timer is cancelled immediately
**And** the voice recording proceeds as normal (from Epic 1)
**And** the AI responds with a follow-up suggestion based on the full thread context — no timer_follow_up is sent

**Given** the caregiver is actively engaging (tapping "Another" repeatedly, speaking follow-ups)
**When** subsequent AI suggestions are returned
**Then** all responses are immediate regardless of "Running low" energy state (FR17)
**And** the timer/breathing flow only applies to the initial AI response in a thread when the AI explicitly suggests a pause — not to every response in a "running low" session

---

## Epic 4: Toolbox — Personal Strategy Playbook UI

Toolbox viewable and manageable in Settings. Full Toolbox UI: browse all saved strategies, see dates, delete entries. Toolbox preview with "View All" expansion. Includes integration testing to verify AI actually changes behavior with Toolbox present. (Note: "That worked" saves and Toolbox-in-AI-context are already working from Epic 1.)

### Story 4.1: Toolbox Full View — Browse All Saved Strategies

As a caregiver,
I want to browse all the strategies I've saved to my Toolbox,
So that I can revisit what has worked before — especially on hard days when I can't think of what to try.

**Acceptance Criteria:**

**Given** the caregiver navigates to the Toolbox section in Settings (FR20, FR37)
**When** the Toolbox has saved entries
**Then** a preview shows the 3 most recent entries with a "View All" expansion option (UX-13)
**And** tapping "View All" displays a full scrollable list of all "That worked" entries
**And** each entry shows the suggestion text and the date it was saved (FR22)
**And** entries are ordered by most recent first
**And** the list scrolls smoothly with no performance issues even with many entries (up to the 50-entry cap from the Toolbox store per SQ-3)

**Given** the caregiver navigates to the Toolbox section in Settings
**When** the Toolbox is empty (no "That worked" saves yet)
**Then** a friendly empty state message is displayed (e.g., "Nothing here yet. When you get a suggestion that helps, tap 'That worked' to save it here.")
**And** the empty state is encouraging, not clinical

**Given** the caregiver views the Toolbox from the full list
**When** they tap on an individual entry
**Then** the full suggestion text is readable (no truncation in the detail/expanded view)

### Story 4.2: Toolbox Entry Management — Delete Strategies

As a caregiver,
I want to remove strategies from my Toolbox that no longer apply,
So that my Toolbox stays relevant and useful as my care situation evolves.

**Acceptance Criteria:**

**Given** the caregiver is viewing the Toolbox list (from Story 4.1)
**When** they initiate a delete action on an individual entry (swipe or delete button)
**Then** a confirmation prompt appears (e.g., "Remove this from your Toolbox?") to prevent accidental deletion
**And** confirming the deletion removes the entry from the Toolbox store (Zustand/MMKV) and the list updates immediately (FR24)
**And** cancelling the confirmation returns to the list with no changes

**Given** the caregiver deletes the last remaining entry
**When** the deletion completes
**Then** the Toolbox transitions to the empty state (from Story 4.1)

**Given** the caregiver deletes a Toolbox entry
**When** the next AI request is sent
**Then** the deleted entry is no longer included in the Toolbox context sent to the AI — the AI's suggestions reflect the updated Toolbox

### Story 4.3: Toolbox Integration Testing — AI Behavior Validation

As a developer,
I want to verify that the AI actually changes its behavior when Toolbox entries are present versus absent,
So that we can confirm the personalization promise works before shipping the Toolbox UI to users.

**Acceptance Criteria:**

**Given** a set of 5+ test scenarios with specific care situations (e.g., "Mom won't eat dinner," "Dad is agitated and pacing")
**When** each scenario is run through the AI pipeline at temperature=0 (or lowest available) for reproducibility, 3 times per condition: once with an empty Toolbox, and once with 3-5 relevant Toolbox entries pre-populated (CM-1)
**Then** the AI's responses demonstrably differ: with Toolbox entries present, the AI explicitly references saved strategies by name or avoids them in favor of new approaches — difference is validated by checking for explicit Toolbox reference/avoidance, not just text similarity (FR46, CM-1)
**And** results are documented for each scenario: all 3 responses per condition (empty vs. populated Toolbox), with notes on whether personalization is consistently observable across runs

**Given** the Toolbox contains entries that are relevant to the current situation
**When** the AI is asked for help
**Then** the AI does not repeat strategies already in the Toolbox verbatim
**And** the AI may reference Toolbox entries as a foundation (e.g., "Last time the music helped — try adding a gentle hand on her shoulder while it plays")

**Given** the test results are reviewed
**When** the AI does not demonstrate meaningful behavioral change with Toolbox context
**Then** the system prompt is iterated to strengthen Toolbox utilization instructions, and tests are re-run until observable personalization is confirmed (PM-4)

---

## Epic 5: Smart Conversation Behaviors

Builds on top of basic threading (already in Epic 1). "Still With You" encouragement after 2+ cycles without "That worked." AI pivots to caregiver-focused inquiry after ~3-4 failed suggestions — with adapted card UI (mic primary, suggestion actions hidden). Graceful "Out of Ideas" endpoint with Toolbox redirect. All AI suggestions achievable in 1-2 minutes.

### Story 5.1: "Still With You" Encouragement Messages

As a caregiver who has been trying multiple suggestions without finding one that works,
I want to feel encouraged that I'm doing my best,
So that I don't feel like a failure when the first few ideas don't help.

**Acceptance Criteria:**

**Given** the caregiver has cycled through 2 or more suggestions in a thread without tapping "That worked"
**When** the next AI suggestion is about to be displayed
**Then** a "Still With You" encouragement banner appears above the suggestion card (UX-5)
**And** the banner displays a message selected from the encouragement pool (ARCH-18) — e.g., "You're still here. That takes strength." / "Every attempt matters, even the ones that don't land." / "You haven't given up. That says everything."
**And** the message selection uses no-consecutive-repeat logic — the same message is never shown twice in a row (ARCH-18)
**And** messages must NOT include toxic positivity (e.g., "You're doing amazing!" / "Everything will be okay!") — they must be grounded, honest, and acknowledge the difficulty (UFG-7, aligned with system prompt safety guardrails)
**And** the banner auto-fades after 3-4 seconds (UX-5)
**And** the suggestion card appears normally below/after the encouragement banner with all standard actions

**Given** the encouragement banner is displayed
**When** the Reduce Motion accessibility setting is enabled
**Then** the banner appears and disappears without fade animation — instant show/hide

**Given** the caregiver taps "That worked" at any point in the thread
**When** the encouragement counter is evaluated
**Then** the counter resets — subsequent threads start fresh with no encouragement banner until the 2+ cycle threshold is hit again (FR18)

### Story 5.2: Conversation Pivot — AI Asks a Question

As a caregiver who has declined several suggestions,
I want the AI to change its approach and ask me what I need,
So that I get more targeted help instead of more guesses.

**Acceptance Criteria:**

**Given** the caregiver has declined approximately 3-4 suggestions in a thread (tapping "Another" or speaking follow-ups indicating the suggestions aren't working)
**When** the AI sends its next response
**Then** the AI pivots from situation-focused suggestions to a caregiver-focused question (FR44) — e.g., "I hear you. Can you tell me more about what you've already tried?" or "What feels most urgent right now?"

**Given** the AI has sent a pivot question (detected via `response_type: "question"` in the API proxy response metadata, per Story 1.6 / SCV-1)
**When** the suggestion card displays the pivot message
**Then** the card UI adapts: the mic button becomes the primary action, "That worked" and "Another" buttons are hidden (UX-16)
**And** a subtle prompt appears on the card: "Hold the mic to respond" (UX-16)
**And** "Dismiss" remains available to end the conversation thread
**And** the card still covers max 60% of screen height with anchor visible (UX-4)

**Given** the caregiver responds to the pivot question via mic or text
**When** the AI receives the response
**Then** the AI uses the additional context to generate a more targeted suggestion
**And** the suggestion card returns to its standard 4-button layout (FR11)
**And** all AI suggestions throughout remain achievable in 1-2 minutes (FR19)

*Testing note (CM-6): The exact pivot trigger count is AI-determined via the system prompt, not client-side logic. The client's role is to detect `response_type: "question"` and adapt the UI. Client-side tests should mock the API response with `response_type: "question"` to verify the card variant UI independently of LLM non-determinism. Card variant transitions (standard → pivot) rely on the AI's question text to carry context for the caregiver — no additional UI chrome is needed. Verify that a first-time user can understand the pivot card without prior instruction (SQ-4).*

### Story 5.3: "Out of Ideas" Graceful Endpoint

As a caregiver who has exhausted the AI's suggestions,
I want an honest acknowledgment and a redirect to what has worked before,
So that I'm not strung along with diminishing-quality suggestions and I know my presence matters.

**Acceptance Criteria:**

**Given** the AI has no more novel suggestions for the current situation (detected via `response_type: "out_of_ideas"` in the API proxy response metadata, ARCH-11 / SCV-1)
**When** the AI sends its final response in the thread
**Then** the response honestly acknowledges it has run out of new ideas (FR45) — e.g., "I've shared what I know for this one. You're not out of options — your Toolbox has strategies that have worked before. And just being there? That matters more than any technique."
**And** the response redirects the caregiver to their Toolbox
**And** the tone affirms the caregiver's presence and effort

**Given** the "Out of Ideas" card is displayed
**When** the caregiver views the card
**Then** the "Another" button is hidden (removed, not just disabled) (UX-14)
**And** the remaining actions are: "That worked" (if the final message resonated), "Dismiss" (end thread), and Mic (to start a new thread on a different topic if desired)

**Given** the caregiver dismisses the "Out of Ideas" card
**When** the thread ends
**Then** the Anchor Screen is fully restored
**And** the caregiver can start a new conversation thread with a completely fresh context by holding the mic again — the AI does not remember or carry over the exhausted thread, so it can try fresh approaches even for the same situation (UFG-8)

*Testing note (CM-6): The "out of ideas" determination is AI-driven via the system prompt. The client's role is to detect `response_type: "out_of_ideas"` and adapt the UI (hide "Another," show Toolbox redirect). Client-side tests should mock the API response with `response_type: "out_of_ideas"` to verify card variant UI independently of LLM non-determinism. The Toolbox redirect message in the AI's response serves as the explanation for why "Another" is gone — no additional UI chrome needed. Verify a first-time user understands this card variant (SQ-4).*
