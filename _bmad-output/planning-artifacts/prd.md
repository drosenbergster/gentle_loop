---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-02-04.md', 'dementia_engagement_app_summary.md', 'person_centered_dementia_care.md', 'caregiving_tools_strategies_dementia.md', 'competitor_analysis_daa_apps.md', 'pm-discovery-session-2026-02-07.md']
workflowType: 'prd'
classification:
  projectType: 'mobile_app'
  domain: 'healthcare'
  complexity: 'high'
  projectContext: 'greenfield'
lastUpdated: '2026-02-07'
---

# Product Requirements Document - gentle_loop

**Author:** Fam
**Date:** 2026-02-04
**Last Updated:** 2026-02-07

## Executive Summary

**gentle_loop** is a mobile app for dementia family caregivers. It provides a calming anchor experience and **AI-powered situational guidance** through voice interaction. Unlike medication trackers or task apps, gentle_loop focuses on the *caregiver's nervous system first*—helping them breathe, reset, and make better decisions under pressure.

The core interaction is simple: open the app, see your anchor image, breathe, hold the mic, describe what's happening. The AI responds with a short, honest, actionable suggestion. If it doesn't fit, tap for another. When something works, save it to your personal **Toolbox** of proven strategies.

The Anchor Screen is deliberately minimal—image, affirmation, mic button. Nothing else competing for attention during a moment when the caregiver has the least cognitive bandwidth.

**Target Users:** Family caregivers (primary), distant family members (secondary), person with dementia (passive recipient).

**Differentiator:** Voice-first AI guidance that adjusts its *tone* based on the caregiver's energy level. When energy is low, the AI leads with permission and breathing before offering practical advice. When energy is higher, it goes straight to action. The AI acts as an honest, grounded companion—not a clinical expert—delivering one suggestion at a time with dignity for everyone involved.

## Success Criteria

### User Success (The "Relief" Moment)
*   **The Moment of Regulation (MVP):** A caregiver opens the app feeling *frustrated*, sees the Anchor, and feels a moment of pause within **10 seconds** of opening.
*   **The "That Worked" Moment (MVP):** A caregiver describes a situation via voice, receives an AI suggestion, and marks it as helpful—building their personal Toolbox of strategies.
*   **The Quiet Room Metric (Phase 2):** A noticeable reduction in repetitive questioning ("What day is it?") due to the persistent visibility of the **Companion Mode** (TV/Tablet display).
*   **The Connection Loop (Phase 2):** A family member sends a "Sticky Note" (Love/Support) and sees it "Viewed," feeling connected without interrupting the care routine.

### Business/Project Success (Adoption & Retention)
*   **Daily Reliance:** The primary caregiver opens the app at least **3 times daily** (Morning Check-In, Stress Moment, Nightly Reset).
*   **Crisis Aversion:** The app is used during at least **50% of high-stress episodes** (Sundowning/Agitation) instead of purely reactive shouting/conflict.
*   **Toolbox Growth:** The caregiver's Toolbox accumulates at least **5 saved strategies** within the first two weeks, indicating the AI is providing actionable value.
*   **Retention:** Family members continue to use the app after the first month (preventing "abandonment" common in health apps).

### Technical Success (MVP)
*   **Zero-Friction Performance:** The app loads the Anchor Screen in under **2 seconds** (critical for stressed users).
*   **Voice-to-Suggestion Speed:** From releasing the mic button to seeing the first AI suggestion: under **5 seconds** (transcription + AI response).
*   **Reliable Local Storage:** Caregiver data (settings, Toolbox) persists across app restarts without data loss.

## Product Scope

### MVP - Minimum Viable Product (Phase 1)

**The Anchor Screen (Existing - To Simplify)**
*   **Anchor Screen:** Rotating affirmation + anchor photo + mic button. Three elements. Maximum calm, minimum friction.
*   **Curated Nudges:** Hard-coded strategies as offline fallback (16 ideas across energy states). Accessible when AI is unavailable.
*   **Onboarding:** 5-step flow (Welcome, How It Works, Name, Anchor Image, Meet the Mic).
*   **Settings:** Personalization, accessibility, energy level, Toolbox, response preferences.
*   **Local Data:** All data stored on device. No login wall.

**Energy Check (Moved to Settings)**
*   **Energy Slider:** 3-position discrete slider ("Running low" → "Holding steady" → "I've got this") now lives in Settings, not on the Anchor Screen. Caregiver sets their energy level when they think to—morning coffee, a quiet moment—and it persists. The AI uses it as tone context.
*   **Two Effective States:** The AI treats energy as two functional states:
    *   **"Running low":** AI leads with permission to pause/breathe (1-2 min), then auto-follows-up with a practical suggestion.
    *   **"Holding steady" / "I've got this":** AI gives practical, actionable suggestions immediately.

**AI Guided Support (New - To Build)**
*   **Voice Input:** Hold-to-talk mic button on the Anchor Screen. Finger down = recording (pulsing mic icon overlay, 60-second max). Finger up = stop and send. Anchor image remains visible underneath.
*   **Processing State:** Mic icon transitions to pulsing ellipses (...) to show AI is thinking.
*   **AI Response:** Short (~40 words), honest, actionable suggestion. Tone: honest friend, not clinical expert. Delivered as text on screen AND optionally read aloud via text-to-speech.
*   **Suggestion Card with Four Actions:**
    1.  **"That worked"** — Saves the suggestion to the Toolbox.
    2.  **"Dismiss"** — Clears the card, back to Anchor Screen. Not helpful, not saving.
    3.  **"Another"** — Cycles to the next AI suggestion.
    4.  **Mic button** — Hold to speak a follow-up for continued conversation.
*   **Swipe left-to-right** also dismisses (same as tapping Dismiss).
*   **"Still With You" Encouragement:** After 2+ suggestion cycles without resolution, the app injects an encouraging meta-message before the next suggestion (e.g., "We're in this together. More ideas coming.").
*   **Timer-Based Follow-Up:** When the AI suggests a breathing/pause activity for a "Running low" caregiver, the app starts a 1-2 minute timer. When it expires, the app proactively offers a practical follow-up suggestion without the caregiver needing to ask.
*   **Toolbox-Aware Suggestions:** The AI receives the caregiver's Toolbox entries as context with every request. It avoids redundant suggestions, references known-good strategies when relevant, and uses Toolbox entries as signal for what types of interventions work for this specific care recipient.
*   **Conversation Pivot:** After ~3-4 suggestions that don't land, the AI shifts from situation-focused suggestions to caregiver-focused inquiry — asking what's getting in the way and whether the caregiver needs emotional support rather than another technique.
*   **Text Input Fallback:** For users who prefer typing or when voice isn't appropriate.
*   **Response Settings:** In Settings, caregiver can choose response mode: text only, audio only, or both (default: both).

**Offline Fallback**
*   When there is no internet connection, the mic button appears grayed out. Tapping it shows a brief message ("AI isn't available offline") and opens the curated Gentle Ideas overlay as a fallback.

### Growth Features (Phase 2)
*   **Daily Energy Check-In Nudge:** On first app open of the day, a subtle non-blocking banner asks "How's your energy today?" with a quick slider that dismisses. Keeps energy level fresh without cluttering the Anchor Screen permanently.
*   **Passive Learning:** The AI begins to recognize patterns from usage history (e.g., "medication refusal" comes up frequently at 6:45 PM). Suggests known-good strategies proactively. Never stores identifying health information.
*   **Companion Mode:** Digital Whiteboard castable to TV/Tablet (Date, Time, Next Event).
*   **Family Sticky Notes:** Asynchronous messages from family to the Anchor Screen (Cloud Sync).
*   **Emergency Contact Framework:** Configurable emergency contacts with contextual surfacing during high-stress interactions. *(Pinned from MVP for later design.)*

### Expansion Features (Phase 3)
*   **Music Integration:** Spotify/Apple Music for one-tap playlist starts.
*   **Wearable Integration:** Detect high heart rate and auto-prompt the Anchor.
*   **Multi-Language Support:** AI responses and UI in multiple languages for diverse caregiver populations.
*   **Multi-Home Support:** Scaling to professional caregivers or multiple households.

### Vision (Future)
*   **Predictive AI:** The app predicts a "Sundown" episode based on historical patterns/weather/time and prompts preventative action *before* it happens.
*   **Community Hive:** Connecting with other "Gentle Loop" families for anonymous emotional support.
*   **Free Tier (Public Launch):** Offline-only version with curated nudges (no AI) as a free entry point. AI Guided Support as a subscription tier.

## User Journeys

### Journey 1: The "Doer" — Crisis Mode, Running Low (She Won't Take Her Meds)

**Persona:** Aunt/Mom ("The Doer"). Exhausted. Standing in the kitchen. Mom is refusing her evening medication again.

*   **Trigger:** Mom pushes away the pill cup. Says "No." Arms crossed. It's the third time today.
*   **Open:** Aunt pulls out her phone. Opens gentle_loop. The Anchor Screen appears—a photo of Mom smiling at Thanksgiving. She takes a breath.
*   **Speak:** She holds the mic button and says: *"She won't take her meds again. I've tried twice already. I don't know what to do."*
*   **AI Response (Running low — Breathe First):** The app displays: *"You've already tried twice. That's enough for right now. Step away, take a breath. Your presence is enough—you don't have to fix this moment."*
*   **Timer:** The app starts a 1-minute timer. Aunt steps into the hallway. Breathes.
*   **Auto-Follow-Up:** Timer expires. The app proactively offers: *"Try coming back in a few minutes with a calm voice and a different approach. Sometimes a change of moment is all it takes."*
*   **"That Worked":** That resonates. Aunt taps **"That worked."** The suggestion is saved to her Toolbox.
*   **Outcome:** Aunt comes back calmer. Tries again with a quieter approach. Stress drops. The strategy is in the Toolbox for next time.

### Journey 2: The "Doer" — Crisis Mode, Holding Steady (He Doesn't Recognize Me)

**Persona:** Daughter visiting Dad. He seems confused today.

*   **Trigger:** Dad looks at her blankly. "Who are you? Why are you in my house?"
*   **Open:** She opens gentle_loop. Sees the anchor image. Takes a breath.
*   **Speak:** She holds the mic: *"He doesn't recognize me today. He's scared of me."*
*   **AI Response (Holding steady — Straight to Action):** *"Don't correct him. Reintroduce yourself gently — 'Hi, I'm here to help.' Stay calm and keep your voice low. Your tone matters more than the words right now."*
*   **Outcome:** She reintroduces herself warmly. Dad relaxes. She didn't need permission to breathe—she needed something to *do*.

### Journey 3: The "Doer" — Toolbox Moment (Morning Check-In)

**Persona:** Same Aunt. It's morning. She has moderate energy today.

*   **Trigger:** She opens the app while drinking coffee. Not in crisis—just thinking about the day ahead.
*   **Browse Toolbox:** She taps into Settings → Toolbox. Sees saved strategies: "Change of moment for meds," "Gentle back scratch during spirals," "Play Frank Sinatra during bath time."
*   **Speak (Optional):** She holds the mic: *"Bath day today. Any tips to make it easier?"*
*   **AI Response:** *"Try starting music before you mention the bath. Warm the room first. If she resists, a warm washcloth wipe-down works just as well."*
*   **Outcome:** Aunt feels prepared. She has a plan. She starts the day with intention instead of dread.

### Journey 4: The "Supporter" (Family Connection) — Phase 2

**Persona:** You (Distant Family). Want to help but don't want to call and interrupt.
*   **Trigger:** Thinking about Mom/Aunt during work.
*   **Action:** Open app → Tap "Send Love."
*   **Input:** Type: "You guys are rockstars! Thinking of you."
*   **Outcome:** The message appears as a **Sticky Note** on Aunt's dashboard (no notification sound) AND rotates onto the **Companion Screen** (TV) so Grandma can see "Love from Fam."

### Journey 5: The "Recipient" (Companion Mode) — Phase 2

**Persona:** Grandmother. Confused about time/place. Anxious.
*   **Trigger:** She looks around the room, feeling unmoored. "When are we going?"
*   **Action:** She looks at the TV.
*   **Display:** High-contrast text: **"TUESDAY. 4:00 PM. DINNER SOON."** + A sticky note: "Love from Fam."
*   **Outcome:** She orients herself. She feels safe. She sits back down.

### Journey Requirements Summary
*   **Two-State Energy Routing:** AI treats energy as two functional states: "Running low" (breathe first, then act) and everything else (act immediately). The situation drives the content; the energy level drives the tone.
*   **Voice-First Interaction:** The primary input method for crisis moments is voice (hold-to-talk). Text is a secondary fallback.
*   **Minimal Anchor Screen:** Image + affirmation + mic button. Energy slider lives in Settings to keep the main screen focused.
*   **Four-Action Suggestion Card:** "That worked" (save) / "Dismiss" / "Another" / Mic (follow-up).
*   **Timer-Based Recharge:** When the AI suggests a pause for a "Running low" caregiver, the app auto-follows-up with a practical suggestion after 1-2 minutes.
*   **"Still With You" Encouragement:** After 2+ cycles, inject an encouraging message before the next suggestion.
*   **Toolbox Persistence & AI Integration:** Saved strategies persist locally, are accessible from Settings, and are sent as context with every AI request to personalize suggestions.
*   **Conversation Threading:** Context persists within a flow (5-7 turns), resets on return to Anchor Screen. After ~3-4 failed suggestions, the AI pivots to caregiver-focused inquiry.
*   **Silent Messaging (Phase 2):** "Sticky Notes" must be push-notification silent but visually persistent.
*   **Casting/Web View (Phase 2):** "Companion Mode" must be a simple URL or Cast target that never sleeps (Wake Lock).

## Domain-Specific Requirements

### Compliance & Regulatory (The "Not a Medical Device" Line)
*   **Disclaimer:** Clear onboarding statement that this is a "Wellness Support Tool," not a medical diagnostic device.
*   **Language Safety:** AI responses must use supportive interpersonal language, never prescriptive/clinical language. No diagnosis, no treatment recommendations.
*   **AI Content Guardrails:** The system prompt must enforce:
    1.  Never diagnose or suggest diagnoses.
    2.  Never recommend medication changes, medication handling, or medication logistics (e.g., "crush into food," "leave on counter," "skip a dose"). Focus on the *interaction*, not the *medication*.
    3.  Never judge, quiz, or imply the caregiver should have already done something ("Have you tried...?" / "You should...").
    4.  Never use toxic positivity or overly coddling language. Be honest, not saccharine.
    5.  Always honor the dignity of both caregiver and care recipient.
    6.  Use plain, warm language—no clinical jargon.
    7.  Do not assume gender of the care recipient unless stated.
    8.  Keep responses as brief as possible while conveying essential information (~40 words).
*   **Emergency Protocol:** *(Pinned for Phase 2 design.)* Future: If danger keywords are detected, surface emergency contacts. For MVP: standard disclaimer only.

### AI System Prompt: Tone & Behavior

> **Full Specification:** See `ai-system-prompt-spec.md` for the complete AI system prompt specification, including knowledge base taxonomy, conversation mechanics, the conversation pivot, and Toolbox integration design.

**Persona:** An honest, grounded friend who has experience with dementia caregiving. Not a therapist, not a textbook, not a cheerleader. Someone who gets it and gives you one useful thing to try.

**Response Pattern:** Loosely follows validation → suggestion → reassurance, but must feel *natural*. Vary phrasing. Never sound templated or robotic. Get to the point quickly—there's urgency.

**Energy-Aware Tone:**

| Energy State | AI Behavior |
|---|---|
| **"Running low"** | Lead with permission: "You don't have to fix this right now." Then suggest a 1-2 minute pause/breathe. The app auto-follows-up with a practical suggestion when the timer expires. |
| **"Holding steady" / "I've got this"** | Go straight to a practical, actionable suggestion. Be direct. Less preamble. |

**After 2+ Failed Suggestions:** Inject encouragement before the next suggestion: *"We're in this together. More ideas coming."* or *"You're not alone in this. Let's keep trying."*

**All Interventions:** Should be doable in **1-2 minutes**. Quick and simple regardless of energy level.

**If Caregiver Is Actively Engaging** (swiping, tapping "Another," speaking follow-ups): Respond **immediately**. No waiting. The timer-based follow-up only applies when the AI explicitly suggests a pause.

**Conversation Pivot (~3-4 Failed Suggestions):** If multiple suggestions don't land, the AI shifts from providing intervention suggestions to understanding what the caregiver needs. It asks gentle clarifying questions about what's getting in the way — surfacing whether they need different suggestions, emotional support, or permission to let go of the situation.

**Toolbox-Aware (MVP):** The AI receives Toolbox entries as context. It avoids redundant suggestions, references known-good strategies when relevant, and uses the Toolbox as signal for what types of interventions work for this specific care recipient.

**Knowledge Base:** The AI draws from five pillars of dementia care knowledge (Person-Centered Care, Non-Pharmacological Interventions, Everyday Care Management, Environment & Technology, Caregiver Support) encompassing 17 evidence-based intervention categories. It never names these categories — it describes techniques in plain, actionable language. See `ai-system-prompt-spec.md` for the complete intervention taxonomy.

### Privacy & Data Security

*   **Ephemeral Audio:** Voice recordings are **transcribed on-device or via API and the audio is immediately discarded**. Audio is never stored on device or server.
*   **Ephemeral AI Context:** Voice transcriptions are sent to the AI API for response generation. The transcription is not persisted on the server after the response is returned. No conversation logs are stored remotely.
*   **Toolbox Storage:** Saved strategies ("That Worked" items) are stored **locally on the device only**. They contain the suggestion text and the date saved. No identifying health information about the care recipient is stored.
*   **No Care Recipient Data:** The app does not collect, store, or transmit the care recipient's name, diagnosis, medication list, or any Protected Health Information (PHI).
*   **Local-First:** Settings, energy level, and Toolbox data are stored locally using encrypted device storage (MMKV). No cloud sync in MVP.
*   **API Key Security:** The AI API key must not be embedded in the client app. API calls should route through a lightweight proxy or edge function to protect credentials.

### Technical Constraints
*   **Offline-Capable Core:** Anchor Screen, affirmations, and curated nudge database must work without network calls (all content local).
*   **AI Requires Connectivity:** The AI Guided Support feature requires an active internet connection. When offline, the mic button appears grayed out; tapping it shows a brief message and opens the curated Gentle Ideas overlay as fallback.
*   **Wake Lock (Phase 2):** Companion Mode must prevent screen from sleeping when casting.

## Innovation & Novel Patterns

### Detected Innovation Areas

1.  **Two-State Energy Routing:**
    *   *Concept:* The AI recognizes two functional caregiver states: "Running low" (needs permission + breathing first) and everything else (ready for action). This replaces complex multi-tier mood tracking with a simple, effective model.
    *   *Differentiation:* Competitors don't adjust *how* they deliver advice based on the caregiver's capacity. We do. Low energy gets a "recharge moment" before practical advice. Higher energy gets straight to action.

2.  **Voice-First AI Guided Support:**
    *   *Concept:* In a crisis moment, the caregiver speaks naturally ("she won't take her meds") and receives a short, tone-aware suggestion they can act on immediately. No typing, no browsing, no menus.
    *   *Differentiation:* No dementia caregiving app offers real-time, voice-activated, energy-aware AI guidance. Existing apps provide static tip libraries or medication reminders. We provide a responsive companion.

3.  **Timer-Based Recharge Flow:**
    *   *Concept:* When the AI tells a depleted caregiver to breathe, the app doesn't abandon them. It sets a timer and proactively follows up with a practical suggestion. The caregiver is recharged and ready to act.
    *   *Differentiation:* No app actively manages the transition from "overwhelmed" to "ready." We bridge that gap.

4.  **The Toolbox (Personal Strategy Playbook):**
    *   *Concept:* Over time, the caregiver builds a personal library of strategies that have actually worked in their specific caregiving situation. The AI can reference these to get smarter over time.
    *   *Differentiation:* No app learns from the individual caregiver's experience and feeds it back.

5.  **Companion Mode (The "Digital Orientation Board") — Phase 2:**
    *   *Concept:* Using existing household hardware (TV/Tablet) as a passive, always-on orientation screen driven by the caregiver's app.

### Market Context
*   **Existing Apps (DAA):** Focus on medication reminders (Memory Clock) or task lists (MapHabit). Some offer static tip libraries.
*   **Our Wedge:** The only solution combining **Real-Time Stress Regulation** (Anchor), **Voice-First AI Guidance** (LLM), **Energy-Aware Tone Routing**, and a **Personal Strategy Playbook** (Toolbox).

### Validation Approach
*   **The "That Worked" Rate:** What percentage of AI suggestions get marked as helpful? Target: >40% on first suggestion, >70% within 3 suggestions.
*   **The "60-Second Test":** Measure if a caregiver's self-reported stress drops after using the Anchor + AI loop.
*   **Toolbox Velocity:** How many strategies are saved per week? Growing Toolbox = growing value.
*   **Recharge Effectiveness:** Do "Running low" caregivers who take the breathing pause engage with the follow-up suggestion? Target: >60%.

### Risk Mitigation
*   **Risk:** AI gives unhelpful or tone-deaf advice.
    *   **Mitigation:** Carefully crafted system prompt with dementia caregiving expertise. "That Worked" / swipe-away signals provide implicit feedback for prompt refinement. Strict never-say list (medication handling, judgment, toxic positivity).
*   **Risk:** Caregivers don't trust AI or feel uncomfortable with voice.
    *   **Mitigation:** Text input fallback. Curated nudges available without AI. Gradual trust-building through consistently good responses.
*   **Risk:** API costs scale unpredictably.
    *   **Mitigation:** Family-only use absorbs cost for now. Rate limiting as a safeguard. Two-tier model (free offline / paid AI) for future public launch.

## Mobile App Specific Requirements

### Project-Type Overview
**Platform Strategy:** Cross-platform Mobile App (React Native / Expo) targeting iOS and Android simultaneously.
**Category:** Health & Fitness / Lifestyle (Explicitly "Non-Medical" to avoid regulatory hurdles).
**Connectivity:** Wi-Fi/Cellular required for AI Guided Support. Core features (Anchor, Curated Nudges) work offline.

### Technical Architecture Considerations
*   **Platform Support:**
    *   **Primary:** Mobile (Phone) for Caregivers and Family.
    *   **Secondary (Phase 2):** Tablet/Smart TV (via Cast/AirPlay) for the "Companion" display.
*   **Permissions Required:**
    *   **Microphone:** For voice input to AI Guided Support (transcribe and discard). Requested during onboarding.
    *   **Internet:** For AI API calls (LLM + optional cloud speech-to-text).
    *   **Local Network (Phase 2):** For discovering Cast devices.
    *   **Wake Lock (Phase 2):** To keep the Companion Screen active.
*   **AI Integration:**
    *   **Speech-to-Text:** On-device (Apple Speech / Google Speech) for low latency, or Whisper API for accuracy. Evaluate both.
    *   **LLM API:** OpenAI, Anthropic, or similar. System prompt encodes dementia caregiving expertise, tone guidelines, and safety guardrails.
    *   **Text-to-Speech:** On-device TTS (expo-speech) for reading AI responses aloud. Configurable in settings.
    *   **API Proxy:** Lightweight backend (Supabase Edge Function or similar) to proxy AI calls and protect API keys.

### Implementation Considerations
*   **Store Compliance:**
    *   **Health & Fitness Category** to position as "Lifestyle" tool.
    *   Must include "Not a Medical Device" disclaimers.
    *   Microphone permission must include clear usage description ("Used to describe caregiving situations for real-time guidance. Audio is never stored.").
*   **User Interface:**
    *   **Minimal Anchor Screen:** Image + affirmation + mic button. Three elements. No slider, no extra navigation.
    *   **High Contrast & Large Buttons:** Essential for stressed/tired eyes. Suggestion card buttons must be legible without glasses.
    *   **Zero-Friction Navigation:** No "Hamburger Menus" deep in the stress flow. Linear, one-tap interactions.
    *   **Mic Button:** Prominent, always-accessible from the Anchor Screen. Large tap target (min 64x64pt). Pulsing visual feedback during recording.
    *   **Suggestion Cards:** Clean, readable cards with four action buttons below. Swipe left-to-right to dismiss.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** "Resilience MVP" — Single-User, High-Impact. Focus on the Caregiver's nervous system first, then give them a voice.
**Philosophy:** Do less, but deeper. A caregiver who can *speak* their problem and *hear* a grounded response in 5 seconds is better served than one browsing a database of tips.

### MVP Feature Set (Phase 1)
*   **Core Journey:** "The Doer" (Aunt/Mom) only.
*   **Features (Existing — To Update):**
    1.  **Anchor Screen:** Photo + breathing animation + rotating affirmations + mic button. Energy slider removed from this screen.
    2.  **Energy Slider:** Moved to Settings. Persists across sessions.
    3.  **Curated Nudges:** 16 hard-coded ideas as offline fallback.
    4.  **Onboarding:** 5-step flow (Welcome, How It Works, Name, Anchor Image, Meet the Mic + mic permission request).
    5.  **Settings:** Personalization, accessibility, energy level, Toolbox, response mode.
    6.  **Local Storage:** MMKV persistence, no login required.
*   **Features (New — To Build):**
    7.  **Voice Input (Mic Button):** Hold-to-talk on Anchor Screen. Pulsing mic overlay during recording. 60-second max. Transcribes speech on release.
    8.  **Processing State:** Pulsing ellipses overlay while AI generates response.
    9.  **AI Guided Support:** Sends transcription + energy level to LLM. Returns ~40-word suggestion with energy-aware tone.
    10. **Two-State Energy Routing:** "Running low" = breathe-first + timer auto-follow-up. Everything else = straight to action.
    11. **Timer-Based Follow-Up:** 1-2 minute timer after breathing suggestion. Proactive follow-up when it expires.
    12. **Text-to-Speech Output:** AI response read aloud (configurable: text/audio/both).
    13. **Suggestion Card (4 Actions):** "That worked" / "Dismiss" / "Another" / Mic for follow-up. Swipe left-to-right to dismiss.
    14. **"Still With You" Encouragement:** After 2+ suggestion cycles, inject encouraging meta-message.
    15. **"That Worked" → Toolbox:** Saves suggestion to Toolbox in Settings.
    16. **Toolbox Section in Settings:** Personal collection of saved strategies. View and delete.
    17. **Text Input Fallback:** Type a situation description when voice isn't appropriate.
    18. **Offline Fallback:** Grayed mic button → tap → brief message → opens Gentle Ideas overlay.
    19. **Settings Additions:** Energy slider, response mode (text/audio/both), Toolbox.
    20. **Onboarding Step 5:** "Meet the Mic" — introduces voice feature + requests microphone permission.
    21. **API Proxy:** Edge function to secure API key.
    22. **Toolbox-Aware AI Context:** Toolbox entries sent with every AI request for personalized, non-redundant suggestions.
    23. **Conversation Threading:** Context persists within a flow (5-7 turns max), resets on return to Anchor Screen.
    24. **Conversation Pivot:** After ~3-4 declined suggestions, AI shifts from situation-focused to caregiver-focused inquiry.

### Post-MVP Features
*   **Phase 2 (Growth):**
    *   **Daily Energy Check-In Nudge:** Subtle non-blocking banner on first open of the day: "How's your energy today?" with quick slider. Dismisses easily.
    *   **Passive Learning:** AI recognizes usage patterns (e.g., recurring situations at specific times) and proactively suggests known-good strategies.
    *   **Support System Section in Settings:** Caregiver can add family members, contacts, and resources. The AI can reference these when relevant (e.g., "Would [contact name] be able to help with this?").
    *   **Companion Mode:** Casting to TV/Tablet.
    *   **Sticky Notes:** Invite Family → Cloud Sync → Shared Wall.
    *   **Emergency Contact Framework:** Configurable contacts with contextual surfacing.
*   **Phase 3 (Expansion):**
    *   **Music Integration:** Spotify API.
    *   **Multi-Language:** AI + UI in multiple languages.
    *   **Wearable Integration:** Heart rate detection → auto-prompt Anchor.
    *   **Free Tier:** Public launch with offline-only free version, AI as subscription.

### Risk Mitigation Strategy
*   **Technical Risk (AI Quality):** Mitigated by investing in the system prompt, strict never-say list, and using established LLM APIs. "That Worked" signals provide implicit quality feedback.
*   **Technical Risk (Latency):** Mitigated by on-device speech-to-text where possible. Pulsing ellipses animation during AI processing to bridge the wait.
*   **Technical Risk (API Key Security):** Mitigated by edge function proxy. Key never in client bundle.
*   **Market Risk (AI Trust):** Mitigated by text input fallback, curated nudges as offline alternative. Users can ease into AI at their own pace.
*   **Market Risk (Adoption):** Mitigated by "Single Player" MVP. Aunt gets value immediately without needing to onboard other family members.

## Functional Requirements

### Caregiver Core (The "Anchor Screen")
*   **FR1:** Caregiver can open the app and immediately see an "Anchor Screen" showing their chosen photo, a rotating affirmation, and a mic button. No other interactive elements on this screen.
*   **FR2:** Affirmations rotate and adapt based on the caregiver's energy level (set in Settings).

### Energy Check (In Settings)
*   **FR3:** Caregiver can set their energy level using a 3-position discrete slider that snaps to "Running low" / "Holding steady" / "I've got this" in the Settings screen. No intermediate values are produced.
*   **FR4:** The energy level persists across sessions and is sent as context with every AI request.

### AI Guided Support (Voice-First Interaction)
*   **FR5:** Caregiver can hold a mic button on the Anchor Screen to record a voice description of their current situation. Hold-to-talk: finger down = recording, finger up = stop and send.
*   **FR6:** During recording, a pulsing microphone icon is overlaid on the Anchor Screen. The anchor image remains visible underneath. Maximum recording time: 60 seconds.
*   **FR7:** Voice audio is transcribed to text (on-device or via API). The audio is immediately discarded after transcription.
*   **FR8:** After transcription, a pulsing ellipses (...) overlay indicates the AI is processing.
*   **FR9:** The transcribed text and current energy level are sent to an AI backend, which returns a contextual suggestion (~40 words).
*   **FR10:** The AI suggestion is displayed on screen as a card AND optionally read aloud via text-to-speech.
*   **FR11:** The suggestion card displays four action buttons:
    *   **"That worked"** — saves the suggestion to the Toolbox.
    *   **"Dismiss"** — clears the card, returns to Anchor Screen.
    *   **"Another"** — cycles to the next AI suggestion.
    *   **Mic button** — hold to speak a follow-up for continued conversation.
*   **FR12:** Swiping the suggestion card left-to-right dismisses it (same as tapping Dismiss).
*   **FR13:** Caregiver can type a situation description as an alternative to voice input.

### Two-State Energy Routing
*   **FR14:** When energy is "Running low," the AI's first response leads with permission to pause and a 1-2 minute breathing/stepping-away suggestion.
*   **FR15:** After the breathing suggestion, the app starts a timer (1-2 minutes). When the timer expires, the app proactively displays a practical follow-up suggestion without the caregiver needing to ask.
*   **FR16:** When energy is "Holding steady" or "I've got this," the AI gives a practical, actionable suggestion immediately with no preamble.
*   **FR17:** If the caregiver is actively engaging (tapping "Another," speaking follow-ups), the AI responds immediately regardless of energy state. The timer only applies when the AI explicitly suggests a pause.

### Conversation Threading & Persistence
*   **FR18:** After 2+ suggestion cycles without the caregiver tapping "That worked," the app displays an encouraging meta-message before the next suggestion (e.g., "We're in this together. More ideas coming.").
*   **FR19:** All interventions suggested by the AI should be achievable in 1-2 minutes.
*   **FR42:** A conversation thread persists from the first mic press through all follow-up interactions (mic follow-ups and "Another" taps) until the caregiver dismisses all cards and returns to the Anchor Screen.
*   **FR43:** The AI receives full conversation context within a thread: original situation, energy level, all previous suggestions given, Toolbox entries, and follow-up input. Maximum 5-7 turns per thread.
*   **FR44:** After approximately 3-4 suggestions that the caregiver declines, the AI pivots from situation-focused suggestions to caregiver-focused inquiry—asking clarifying questions about why the suggestions aren't landing and whether the caregiver needs a different kind of support.
*   **FR45:** When the AI has no more novel suggestions, it acknowledges this honestly, redirects the caregiver to their Toolbox, and affirms that their presence matters.

### Toolbox (Personal Strategy Playbook)
*   **FR20:** The Toolbox is accessible from the Settings screen, keeping the Anchor Screen focused and uncluttered.
*   **FR21:** The Toolbox displays all strategies previously marked as "That worked."
*   **FR22:** Each Toolbox entry includes the suggestion text and the date it was saved.
*   **FR23:** Toolbox data is stored locally on the device only (MMKV). No cloud sync in MVP.
*   **FR24:** Caregiver can delete entries from the Toolbox.
*   **FR46:** Toolbox entries are sent as context with every AI request so the AI can reference known-good strategies, avoid redundant suggestions, and learn what types of interventions work for this specific care recipient.

### Content & Personalization
*   **FR25:** Caregiver can upload or select photos for the Anchor Screen.
*   **FR26:** System provides a pre-loaded curated nudge database (16 ideas across energy states) as offline fallback.

### Offline Behavior
*   **FR27:** When the device has no internet connection, the mic button appears grayed out on the Anchor Screen.
*   **FR28:** Tapping the grayed-out mic button shows a brief message ("AI isn't available offline") and then opens the curated Gentle Ideas overlay.

### Onboarding & Safety
*   **FR29:** Caregiver can complete onboarding in 5 steps: Welcome, How It Works, Your Name, Your Anchor, Meet the Mic.
*   **FR30:** The "Meet the Mic" onboarding step introduces the voice feature ("When you need help, hold the mic and describe what's happening") and requests microphone permission.
*   **FR31:** Caregiver must accept a "Wellness Tool, Not Medical Device" disclaimer before first use.
*   **FR32:** AI-generated content includes a persistent subtle indicator that responses are AI-generated (e.g., small label).

### Settings & Preferences
*   **FR33:** Caregiver can set their energy level via slider in Settings.
*   **FR34:** Caregiver can choose AI response mode: text only, audio only, or both (default: both).
*   **FR35:** Caregiver can adjust accessibility settings: reduce motion, larger text, high contrast.
*   **FR36:** Caregiver can change their name and anchor image from Settings.
*   **FR37:** Toolbox is accessible as a section within the Settings screen.
*   **FR38:** All settings persist locally across sessions.

### Data & Privacy
*   **FR39:** Voice audio is transcribed and deleted immediately. It is never stored on device or server.
*   **FR40:** AI API calls route through a server-side proxy; the API key is never exposed in the client app.
*   **FR41:** Caregiver's local data (settings, energy state, Toolbox) persists across app restarts without data loss.

## Non-Functional Requirements

### Performance
*   **NFR1:** The Anchor Screen must load and be interactive within **2 seconds** of app launch.
*   **NFR2:** Voice transcription must complete within **2 seconds** of the caregiver releasing the mic button.
*   **NFR3:** AI suggestion must appear on screen within **3 seconds** of transcription completing (total voice-to-suggestion: **≤5 seconds**).
*   **NFR4:** Text-to-speech playback must begin within **1 second** of the suggestion appearing on screen.
*   **NFR5:** Swiping to the next suggestion must feel instant (<300ms) if the AI has pre-generated alternatives.
*   **NFR6:** Timer-based follow-up must fire within **3 seconds** of timer expiry (including AI response time for the follow-up suggestion).

### Security & Privacy
*   **NFR7:** Voice audio must be discarded within **5 seconds** of transcription completion.
*   **NFR8:** All local data must be encrypted at rest (MMKV encryption).
*   **NFR9:** No personally identifiable health data about the care recipient is transmitted to or stored on external servers.
*   **NFR10:** AI API key must be secured server-side; the client app must never contain the key directly.

### Accessibility
*   **NFR11:** All interactive elements must have a minimum tap target of **44x44 points** (Apple HIG).
*   **NFR12:** Text on Anchor Screen and suggestion cards must meet **WCAG AA contrast ratio** (4.5:1).
*   **NFR13:** App must support system-level "Large Text" accessibility settings.
*   **NFR14:** The mic button must be large enough to hold comfortably under stress (minimum **64x64 points**).
*   **NFR15:** Suggestion card action buttons must be large and legible without glasses (minimum **44x44 points** each, clear labels).
*   **NFR16:** Text-to-speech output must use a calm, clear voice at adjustable speed.

### Reliability
*   **NFR17:** If the AI API is unreachable, the grayed mic button must respond to taps within **1 second**, showing the offline message and opening Gentle Ideas.
*   **NFR18:** The Anchor Screen, affirmations, and Toolbox must function fully without network connectivity.
