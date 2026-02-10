---
inputDocuments: ['prd.md', 'ai-system-prompt-spec.md', 'ai-system-prompt-production.md']
---

# UX Design Specification - gentle_loop

**Author:** Fam
**Date:** 2026-02-04
**Updated:** 2026-02-09 (reflects PRD v2026-02-07 — AI Guided Support, mic-first Anchor Screen, Toolbox-aware AI, conversation threading)

---

## Executive Summary

### Project Vision
gentle_loop is a mobile app that serves as a "life raft" for dementia family caregivers. Unlike medication trackers or task apps, it focuses on the caregiver's nervous system first — helping them regulate their own stress before managing the person with dementia.

### Target Users
1. **"The Doer" (MVP):** Hands-on caregiver. Exhausted, often mid-crisis. Needs immediate emotional reset, not more tasks.
2. **"The Supporter" (Phase 2):** Distant family who want to help without interrupting.
3. **"The Recipient" (Phase 2):** Person with dementia needing passive environmental orientation.

### Key Design Challenges
1. **Crisis-State Usability:** User is stressed, hands may be occupied, cognitive load is high. Every tap must be deliberate and calming.
2. **Emotional Design:** The app must feel like a friend, not a tool. Visual language should soothe, not remind them of medical apps.
3. **Voice-First Under Stress:** The mic button is the primary interaction. Must be discoverable, large, and work with one hand while shaking.
4. **Zero-Friction Onboarding:** Must be usable within 30 seconds of download.

### Design Opportunities
1. **The Pause Effect:** Every transition can be a micro-moment of calm.
2. **Color as Communication:** Sunset gradient (Twilight → Rose → Gold) reinforces emotional state without words.
3. **Voice-First Input:** Caregiver can speak instead of typing during crisis. The mic is always one tap away.
4. **Progressive Disclosure:** The Anchor Screen shows only three elements. Everything else emerges only when needed.

### Color Direction: Sunset Gradient
| State | User-Facing Label | Color |
|-------|-------------------|-------|
| Low | "Running low" | Soft twilight purple |
| Medium | "Holding steady" | Dusty rose / coral |
| High | "I've got this" | Golden hour amber |

## Core User Experience

### Defining Experience
The caregiver opens the app in a moment of stress, sees the Anchor (photo/affirmation), and holds the mic to describe what's happening. The AI responds with a short, honest suggestion they can try right now. **Time from open to first AI suggestion: under 10 seconds.**

**Core Loop:**
```
Open → Anchor (pause) → Hold mic (speak) → AI suggestion → Act or cycle
```

### Platform Strategy
- **Mobile-first:** iOS + Android via React Native
- **One-handed operation** assumed during crisis
- **Offline-capable:** Core features (Anchor + curated ideas) work without network
- **Accessibility:** Large tap targets (44x44pt minimum, 64x64pt for mic), high contrast

### Primary User Flow (Updated)
1. **App Opens** → Straight to Anchor Screen (no splash delay)
2. **Anchor Screen** → Full screen photo + affirmation + mic button. Three elements. Nothing else.
3. **Voice Input** → Caregiver holds mic button, describes what's happening. Finger down = recording.
4. **Processing** → Pulsing ellipsis overlay while AI thinks. Anchor image stays visible underneath.
5. **AI Suggestion** → Short (~40 word) suggestion card appears. Four actions: "That worked" / "Dismiss" / "Another" / Mic follow-up.
6. **Resolution** → "That worked" saves to Toolbox. "Dismiss" returns to Anchor. "Another" cycles. Mic enables follow-up.

### Effortless Interactions
- **Immediate Anchor:** No login, no splash, no delay — straight to calm
- **Always-Available Voice:** Mic button prominent on Anchor Screen, never hidden behind menus
- **Hold-to-Talk:** Natural gesture. Finger down = recording, finger up = send. No tap-to-start/tap-to-stop confusion.
- **Energy in Settings:** The energy slider lives in Settings, not cluttering the Anchor Screen. Set it during a quiet moment (morning coffee), not during crisis.
- **Swipe to Dismiss:** Suggestion card swipes left-to-right to dismiss. No confirmation dialogs.

### Critical Success Moments
1. **The Pause** — Anchor image forces a breath before any action
2. **The Voice** — Holding the mic and speaking out loud is itself therapeutic
3. **The Suggestion** — AI responds like a friend who gets it, not a textbook
4. **The Save** — "That worked" builds a personal Toolbox over time

### Experience Principles
1. **Calm Before Action** — Always pause before prompting input
2. **Permission Over Performance** — Low energy isn't failure, it's information
3. **One Tap, One Outcome** — No multi-step flows during crisis
4. **Voice as Primary** — The mic is the hero, typing is the fallback
5. **Progressive Disclosure** — Show only what's needed in the moment

## Desired Emotional Response

### Emotional Journey Mapping

| Moment | Current Feeling | Desired Feeling |
|--------|-----------------|-----------------|
| **Opens app** | Overwhelmed, frustrated, guilty | "Okay, I have somewhere to go" |
| **Sees Anchor** | Racing thoughts | A breath. One moment of stillness. |
| **Holds mic** | Desperate, need to be heard | "Someone is listening" |
| **Speaks** | Isolated, no one understands | "I can say what's happening" |
| **Sees suggestion** | Desperate for help | "Someone gets it. I'm not alone." |
| **Taps 'That worked'** | Relieved | "I'm building something. This is getting easier." |
| **Closes app** | Exhausted | "I can do this. Or I can stop. Both are okay." |

### Primary Emotional Goals

1. **Seen** — "This app understands what I'm going through."
2. **Permission** — "It's okay to feel this way. It's okay to stop."
3. **Capable** — "I have options. I'm not trapped."

### Emotions to Avoid

- **Judgment** — No "you should be doing more"
- **Clinical coldness** — No medical/sterile feeling
- **Complexity overwhelm** — No "figure this out yourself"
- **Guilt** — App never acknowledges gaps in usage; every open feels like first open

### Micro-Emotions & Design Implications

| Micro-Emotion | Design Implication |
|---------------|-------------------|
| **Trust** | Consistent, predictable behavior. No surprises. |
| **Safety** | Soft colors, rounded corners, gentle transitions. |
| **Validation** | AI acknowledges difficulty before offering help. |
| **Relief** | Suggestions give permission, not just advice. |
| **Agency** | Four actions on every card — caregiver is always in control. |

### Emotional Design Principles

1. **Acknowledge Before Advise** — AI leads with validation (when energy is low)
2. **Soft Everything** — Rounded corners, gentle gradients, eased animations
3. **No Exclamation Points** — Calm typography, no urgency in the UI
4. **Breathing Room** — Generous whitespace, nothing crowded

## AI Guided Support — Interaction Design (NEW)

### Interaction States

The AI interaction flows through distinct states. Only one state is active at a time. The Anchor Screen is always visible underneath.

```
[Anchor] → [Recording] → [Processing] → [Suggestion Card]
                                              ↓
                              [Timer]  ←  (if running low)
                                ↓
                          [Follow-up Suggestion Card]
```

### State 1: Anchor Screen (Resting)

Three elements: anchor image, affirmation, mic button. Settings icon in the corner. Nothing else. The energy slider is NOT on this screen — it lives in Settings.

- The mic button is large (64x64pt minimum), always visible, always ready
- Background subtly tinted by current energy state (set in Settings)

### State 2: Recording (Hold-to-Talk)

Triggered when the caregiver presses and holds the mic button.

- Mic icon transitions to a pulsing recording indicator
- The anchor image remains visible underneath (not replaced)
- A subtle "Listening..." label appears
- Optional: live transcription text appears as they speak
- Maximum recording time: 60 seconds
- Finger up = stop recording and send for transcription

**Design notes:**
- This is NOT a modal — it's an overlay on the Anchor Screen
- The anchor image stays visible to maintain the calming presence
- The caregiver should feel like they're talking TO the anchor, not to a machine

### State 3: Processing

After the caregiver releases the mic button, transcription and AI processing begin.

- Pulsing ellipsis (...) animation replaces the mic icon
- Anchor image stays visible
- No other UI changes — keep it calm

**Target duration:** <5 seconds total (transcription + AI response)

### State 4: Suggestion Card

The AI's response appears as a card overlaying the Anchor Screen.

- Card slides up from the bottom
- Contains the suggestion text (~40 words)
- Four action buttons below the text:
  1. **"That worked"** — saves to Toolbox, dismisses card
  2. **"Dismiss"** — clears card, returns to Anchor
  3. **"Another"** — AI generates a different suggestion
  4. **Mic button** — hold to speak a follow-up
- Swipe left-to-right also dismisses (same as tapping Dismiss)
- Small "AI-generated" label on the card (subtle, not prominent)

**Design notes:**
- If `responseMode` is "audio" or "both", TTS reads the suggestion aloud simultaneously
- The anchor image is dimmed but visible behind the card
- Card should not cover more than 60% of the screen — the anchor presence matters

### State 4b: Crisis Detection — Simplified UI (UX-3)

If the suggestion card is visible and there is no user interaction (no taps, no voice, no scrolls) for 5+ consecutive seconds:

- The card actions and secondary UI elements fade out
- Only the anchor image and a gentle breathing pulse remain visible
- The breathing pulse is a slow, ambient animation — not instructional, just ambient calm
- Any touch interaction restores the full suggestion card immediately
- This is a "be present" state, not a timeout — no dismissal, no new content

**Design notes:**
- This addresses moments of overwhelm where the caregiver might freeze
- The simplified view removes decision pressure
- The anchor remains the focal point — their grounding presence
- The restoration is instant on any touch — no fade-in delay

### Suggestion Card Variants

The suggestion card adapts its visual presentation based on the AI's `response_type`:

| response_type | Card Behavior |
|---|---|
| `suggestion` | Standard suggestion card with all 4 action buttons |
| `pause` | Suggestion text + auto-transition to breathing timer. "That worked" and "Another" hidden; "Skip" prominent |
| `question` | Question text displayed; mic button and text input emphasized; "Another" and "That worked" de-emphasized |
| `out_of_ideas` | Suggestion text + Toolbox redirect. "Another" button hidden; "Open Toolbox" button added if Toolbox has entries |

**Design notes:**
- Transitions between variants happen via content changes, not chrome/layout changes — the card maintains its position and shape
- The card variant is determined by the `response_type` metadata from the API, not by parsing AI text

### State 5: "Still With You" Encouragement

After 2+ "Another" cycles without a "That worked" tap:

- A brief encouragement message appears ABOVE the suggestion card
- Messages come from a predefined pool (8 messages)
- Displayed as a small banner, not a card — it shouldn't feel like another suggestion
- Auto-fades after 3-4 seconds or when the caregiver interacts with the suggestion card
- Never repeats the same message consecutively

**Design notes:**
- This is APP-GENERATED, not from the AI
- Subtle, warm, brief — like a hand on the shoulder
- Examples: "Still here with you. Let's try a different angle." / "Every situation is different. Let's try something else."

### State 6: Timer / Breathing Pause (Running Low Flow)

When the caregiver's energy is "running low" and they use the mic:

1. AI's first response is a validation + permission to pause + breathing suggestion
2. The app detects this and starts a timer (90 seconds default)
3. Timer UI appears: a calming countdown or breathing animation
4. When timer expires, the app automatically requests a practical follow-up from the AI
5. The follow-up suggestion appears as a new suggestion card

**Timer UI design:**
- Breathing animation: gentle expanding/contracting circle
- Optional countdown: minutes:seconds in calm, low-contrast text
- "Skip" option available — the caregiver can skip the timer at any time
- If the caregiver taps the mic during the timer, the timer cancels and they enter a voice follow-up instead

### State 7: Conversation Pivot

After ~3-4 suggestions that don't land (repeated "Another" taps), the AI pivots from giving suggestions to asking what the caregiver needs.

- The suggestion card now contains a question instead of a suggestion
- The four action buttons are still present, but "Another" and "That worked" may feel less relevant
- The mic button becomes the primary expected interaction — the caregiver responds verbally

**Design notes:**
- The card looks the same as a regular suggestion card — the AI's question IS the response
- No special UI treatment needed. The tone shift happens in the AI's words, not in the UI.

### State 8: Out of Ideas

When the AI has no more novel suggestions:

- The suggestion card contains the AI's honest acknowledgment
- "Another" button is hidden (or disabled) — no more cycling
- If the Toolbox has entries, the AI mentions it; a "View Toolbox" link could appear on the card
- "That worked" is still available (the acknowledgment itself can be helpful)
- "Dismiss" returns to Anchor
- Mic is still available for follow-up (new context may unlock new suggestions)

### Text Input Fallback

For caregivers who prefer typing or when voice isn't appropriate:

- A small text/keyboard icon near the mic button
- Tapping it opens a text input field
- Submit sends the typed text through the same AI pipeline
- All suggestion card interactions work the same

**Design notes:**
- The text input should be secondary to the mic — smaller, less prominent
- It's an escape hatch, not the primary path

## Toolbox UX (NEW)

### Access

The Toolbox is a section within the Settings screen. It is NOT on the Anchor Screen — keeping the main screen focused and uncluttered.

### Toolbox List

- Displays all saved "That worked" strategies
- Each entry shows: suggestion text + date saved
- Entries ordered by most recent first
- Swipe to delete individual entries
- Empty state: "Your Toolbox is empty. When an AI suggestion works, tap 'That worked' to save it here."

### Toolbox & AI Integration

The Toolbox is invisible in the UI flow — the caregiver doesn't need to know it's being sent to the AI. The AI simply avoids suggesting things already in the Toolbox and references known-good strategies when relevant.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

| App | What They Nail | Relevance to gentle_loop |
|-----|----------------|-------------------------|
| **Calm / Headspace** | Immediate calm upon opening. Soft colors, gentle animations, breathing room. | Anchor Screen philosophy, transition animations, timer UI |
| **Daylio** | One-tap mood logging with colors/icons. No typing required. | Energy slider interaction pattern (in Settings) |
| **WeCroak** | Ultra-minimal. Just a quote and a moment. Nothing else. | Anchor Screen simplicity — three elements only |
| **Emergency SOS Apps** | Big buttons, zero ambiguity, works under stress. | Mic button size and prominence |
| **Voice Memos** | Hold-to-record is intuitive. Natural gesture. | Hold-to-talk mic interaction |

### Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Gamification (streaks, points) | Adds guilt. "I missed a day" = failure. |
| Onboarding carousels | 5 swipes before value = abandoned app. |
| Bottom tab bars with 5+ icons | Too many choices during crisis. |
| Bright notification badges | Red dots = anxiety, not calm. |
| 10-option mood selectors | Decision fatigue. Three states max. |
| Tap-to-start/tap-to-stop recording | Confusing under stress. Hold-to-talk is clearer. |
| Modal dialogs that block the anchor | The anchor's calming presence must persist through all states. |

## Design System Foundation

### Design System Choice

**Themeable System: React Native Paper**

A pre-built, accessible component library with deep customization support for React Native.

### Rationale

1. **Speed for MVP** — Proven components reduce development time
2. **Full Themability** — Sunset palette + soft aesthetic can be applied globally
3. **Accessibility First** — Built-in screen reader support critical for stressed users
4. **React Native Native** — No performance compromises from web-first libraries

### Customization Strategy

| Element | Default | Our Override |
|---------|---------|--------------|
| Border Radius | 4px | 16-24px (soft) |
| Spacing | 8px base | 12-16px base (breathing room) |
| Colors | Material palette | Sunset gradient tokens |
| Typography | System default | Poppins (soft, rounded sans-serif) |
| Transitions | 200ms | 400-600ms (gentle) |

## Visual Design Foundation

### Color System

**Primary Palette: Sunset Gradient**

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--energy-resting` | Twilight Purple | #6B5B7A | Low energy state, screen tint |
| `--energy-warming` | Dusty Rose | #C4A4A4 | Medium energy state, screen tint |
| `--energy-glowing` | Golden Hour Amber | #E8C47C | High energy state, screen tint |
| `--bg-primary` | Warm Cream | #FAF8F5 | Default app background |
| `--text-primary` | Warm Charcoal | #3D3A38 | Body text |
| `--surface` | Muted Lavender | #E8E4EC | Cards, surfaces |
| `--success` | Sage | #A8B89C | "That worked" button, positive feedback |

**Screen Tinting:** Background subtly shifts based on the energy state set in Settings — immersive but not overwhelming.

**Color Philosophy:** Warm, natural, non-clinical. All three energy states are equally beautiful — no state feels like failure.

### Typography System

**Font Family:** Poppins
- Soft, rounded but structured
- Excellent legibility at all sizes
- Friendly without being childish
- Clean and easy to read under stress

**Type Scale:**

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `--text-affirmation` | 28-32px | 500 | Anchor affirmations |
| `--text-suggestion` | 18px | 400 | AI suggestion text on card |
| `--text-energy` | 20px | 500 | Energy state labels (in Settings) |
| `--text-body` | 16px | 400 | General text |
| `--text-encouragement` | 15px | 400 | "Still With You" messages |
| `--text-caption` | 14px | 400 | Supporting info, timestamps |
| `--text-label` | 12px | 400 | AI-generated label, section headers |

### Spacing & Layout Foundation

**Base Unit:** 12px

**Spacing Scale:**
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 12px
- `--space-lg`: 24px
- `--space-xl`: 48px

**Layout Principles:**
1. Very airy — meditation-app minimal feel
2. One primary focus per screen (Anchor Screen: the image. Suggestion Card: the text.)
3. 48px minimum touch targets (64px for mic)
4. 24px minimum margins
5. Suggestion card never covers more than 60% of screen height

### Animation Strategy

| Context | Animation |
|---------|-----------|
| **Anchor Screen** | Gentle breathing pulse (subtle, calming rhythm) |
| **Recording** | Pulsing mic ring (1s loop) |
| **Processing** | Pulsing ellipsis (gentle fade in/out) |
| **Suggestion card** | Slide up from bottom (400ms ease-out) |
| **Suggestion dismiss** | Slide down or swipe-right (300ms ease-in) |
| **Timer breathing** | Expanding/contracting circle (4s cycle, matches breathing) |
| **Encouragement** | Fade in above card (300ms), auto-fade out (3-4s) |
| **Transitions** | Soft fades (400-600ms) |

**Animation Philosophy:** Gentle presence, not distraction. The pulse invites a breath; it doesn't demand attention.

### Accessibility Considerations

| Need | Implementation |
|------|----------------|
| Low vision | Large text, high contrast (WCAG AA 4.5:1) |
| Shaky hands | 64px mic button, 48px+ action buttons, generous spacing |
| Color blindness | Energy states labeled with words + color |
| Motion sensitivity | Reduce motion option disables pulse/animations |
| System scaling | Respects user's system font size preferences |
| Screen reader | Full VoiceOver/TalkBack support on all elements |
| One-handed use | All primary interactions reachable with thumb |

## Onboarding Flow (Updated)

### Flow Summary

| Step | Content | Required? |
|------|---------|-----------|
| 1. Welcome | What the app is, core value prop | Yes |
| 2. How It Works | Quick visual demo of the loop | Yes |
| 3. Your Name | Simple text entry | Yes |
| 4. Your Anchor | Photo upload OR skip with default | Optional (skippable) |
| 5. Meet the Mic | Introduces voice feature + requests mic permission + disclaimer | Yes |
| → Anchor Screen | Begin using the app | — |

**Key Principle:** Onboarding is *setup*, not *value*. Value starts at Anchor Screen.

**Step 5 — Meet the Mic (NEW):**
- Headline: "When you need help, hold the mic and describe what's happening."
- Brief animation showing the hold-to-talk gesture
- Microphone permission request (with clear usage description: "Audio is never stored")
- "Wellness Tool, Not Medical Device" disclaimer acceptance
- This step is critical — it's the caregiver's introduction to the primary interaction pattern

## Curated Ideas (Offline Fallback)

### Language Philosophy: Softer, Warmer, Human

The curated ideas library uses intentionally soft language. "Strategies" felt too clinical. Instead: **Ideas** — helpful thoughts from a friend.

**Key Language Decisions:**
- **Accessed via:** Offline fallback (grayed mic tap) or Settings browse
- **Actions:** "Something else" / "That helps"
- **No category labels** — Just validation + title + idea
- **No source citations** — Trust comes from helpfulness, not from research labels

### Ideas by Energy State

**Running Low** — Focus: Giving yourself permission

| Title | Idea |
|-------|------|
| Feel your feet on the floor | Name 5 things you can see. 4 you can touch. 3 you can hear. This tells your body it's safe. |
| Say it out loud | "I'm doing the best I can. I can't control everything." Your brain believes what it hears you say. |
| Try this breath | In for 4. Out for 6. The longer exhale tells your body it's safe. Do it three times. |
| Find a familiar scent | Coffee, a lotion you love, fresh air. Something that brings you back to yourself. |

**Holding Steady** — Focus: Tools for the moment

| Title | Idea |
|-------|------|
| Feelings before fixing | Try "I can see you're upset" before solving anything. Validation opens doors. |
| Change the scene | If they're stuck in a loop, move somewhere else. Movement breaks thought patterns. |
| Show instead of tell | Hold up the mug instead of saying "coffee." Visuals often land when words don't. |
| Check the basics | Hungry? Thirsty? In pain? Need bathroom? Too hot or cold? Behavior is often telling you something. |
| Lower and slower | Speak slower and lower. A calm tone signals safety. |
| One question at a time | "Are you cold?" works. "Do you want a sweater or blanket?" overwhelms. |

**I've Got This** — Focus: Setting yourself up

| Title | Idea |
|-------|------|
| Set up the space | Good moment to reduce clutter, label things. A calmer space means fewer hard moments. |
| Same time, same way | Routines reduce anxiety. Write down what works and repeat it. |
| Note what's working | What music helped? What phrase landed? Future you will thank present you. |
| When did you last ask for help? | Even 2 hours away helps you show up better. Who could you reach out to? |
| Try a photo or song | Familiar music can shift the mood even when words don't land. |
| Set up tomorrow tonight | Lay out clothes. Prep breakfast. Small things now mean fewer decisions when tired. |

### Idea Card Format (Offline Fallback)

```
┌─────────────────────────────────────────┐
│                                         │
│ "Running on empty is exhausting.        │
│  You're still showing up — that         │
│  matters."                              │
│                                         │
│ Feel your feet on the floor             │
│                                         │
│ Name 5 things you can see. 4 you can    │
│ touch. 3 you can hear. This tells       │
│ your body it's safe.                    │
│                                         │
│                                         │
│ [Something else]       [That helps]     │
│                                         │
└─────────────────────────────────────────┘
```

**Note:** This card format is for the *offline curated ideas*. The AI suggestion card has a different format with 4 actions (That worked / Dismiss / Another / Mic). See AI Guided Support section above.

## Settings Screen (Updated)

### Sections

1. **Personalization** — Name, anchor image
2. **Energy Level** — 3-position discrete slider (Running low → Holding steady → I've got this)
3. **AI Response** — Response mode (text only / audio only / both), TTS playback speed
4. **Toolbox** — View and manage saved strategies
5. **Accessibility** — Reduce motion, larger text, high contrast
6. **About** — Version, privacy policy, feedback

### Energy Slider in Settings

The energy slider now lives in Settings, not on the Anchor Screen. The caregiver sets it when they think to — morning coffee, a quiet moment — and it persists. The AI uses it as tone context.

- 3-position discrete slider with snap positions (no intermediate values)
- Gradient track: Twilight → Rose → Gold
- Labels at each snap position: "Running low" / "Holding steady" / "I've got this"
- Persists across sessions
- A brief helper text: "This helps the AI adjust its tone. Set it whenever you think to — no pressure."

### Toolbox in Settings

- List view of all "That worked" strategies (up to 50 entries)
- Each entry: suggestion text + "Saved [date]"
- Swipe to delete
- Empty state message when no entries saved yet
- When approaching capacity (45+ entries), show a subtle banner: "Your Toolbox is getting full. Oldest entries will be replaced when you save new ones."
- When at capacity (50 entries), oldest entry is silently replaced (FIFO) on next save
