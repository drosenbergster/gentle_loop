---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md', 'brainstorming-session-2026-02-04.md', 'dementia_engagement_app_summary.md', 'person_centered_dementia_care.md', 'caregiving_tools_strategies_dementia.md', 'competitor_analysis_daa_apps.md']
---

# UX Design Specification - gentle_loop

**Author:** Fam
**Date:** 2026-02-04

---

## Executive Summary

### Project Vision
gentle_loop is a mobile app that serves as a "life raft" for dementia family caregivers. Unlike medication trackers or task apps, it focuses on the caregiver's nervous system first—helping them regulate their own stress before managing the person with dementia.

### Target Users
1. **"The Doer" (MVP):** Hands-on caregiver. Exhausted, often mid-crisis. Needs immediate emotional reset, not more tasks.
2. **"The Supporter" (Phase 2):** Distant family who want to help without interrupting.
3. **"The Recipient" (Phase 2):** Person with dementia needing passive environmental orientation.

### Key Design Challenges
1. **Crisis-State Usability:** User is stressed, hands may be occupied, cognitive load is high. Every tap must be deliberate and calming.
2. **Emotional Design:** The app must feel like a friend, not a tool. Visual language should soothe, not remind them of medical apps.
3. **Zero-Friction Onboarding:** Must be usable within 30 seconds of download.

### Design Opportunities
1. **The Pause Effect:** Every transition can be a micro-moment of calm.
2. **Color as Communication:** Sunset gradient (Twilight → Rose → Gold) reinforces emotional state without words.
3. **Voice-First Input:** Caregiver can speak instead of typing during crisis.

### Color Direction: Sunset Gradient
| State | Label | Color |
|-------|-------|-------|
| Low | Resting | Soft twilight purple |
| Medium | Warming | Dusty rose / coral |
| Full | Glowing | Golden hour amber |

## Core User Experience

### Defining Experience
The caregiver opens the app in a moment of stress, sees the Anchor (photo/affirmation), checks in with their energy level, and receives permission or guidance. **Time from open to relief: 60 seconds or less.**

**Core Loop:**
```
Open → Anchor (pause) → Energy Check (slider) → Idea (gentle nudge) → Relief
```

### Platform Strategy
- **Mobile-first:** iOS + Android via React Native
- **Touch-based:** One-handed operation assumed
- **Offline-capable:** Core features (Anchor + Ideas Library) work without network
- **Accessibility:** Large tap targets (44x44pt minimum), high contrast

### Primary User Flow
1. **App Opens** → Straight to Anchor Screen (no splash delay)
2. **Anchor Screen** → Full screen photo + affirmation. Mic icon always visible in corner.
3. **Energy Check** → After 1-2 seconds (or on tap), three sunset states fade in below. Anchor shrinks slightly.
4. **Input** → User taps an energy state OR speaks via always-available mic
5. **Idea** → A helpful thought appears based on state + optional voice context

### Effortless Interactions
- **Immediate Anchor:** No login, no splash, no delay—straight to calm
- **Always-Available Voice:** Mic icon persistent, never hidden behind menus
- **Energy Slider:** Continuous slider to communicate state—no categories to choose from
- **Contextual Ideas:** System responds to state without requiring explanation

### Critical Success Moments
1. **The Pause** — Anchor forces a breath before any action
2. **The Permission** — Sliding to "Resting" (purple) triggers "It's okay to stop"
3. **The Relief** — Idea lands and they feel *seen*, not lectured

### Experience Principles
1. **Calm Before Action** — Always pause before prompting input
2. **Permission Over Performance** — Low energy isn't failure, it's information
3. **One Tap, One Outcome** — No multi-step flows during crisis
4. **Voice as Escape Hatch** — Always available, never required

## Desired Emotional Response

### Emotional Journey Mapping

| Moment | Current Feeling | Desired Feeling |
|--------|-----------------|-----------------|
| **Opens app** | Overwhelmed, frustrated, guilty | "Okay, I have somewhere to go" |
| **Sees Anchor** | Racing thoughts | A breath. One moment of stillness. |
| **Taps Energy State** | Shame about being depleted | "It's okay to be here. This is information, not failure." |
| **Receives Idea** | Desperate for help | "Someone gets it. I'm not alone." |
| **Closes app** | Exhausted | "I can do this. Or I can stop. Both are okay." |

### Primary Emotional Goals

1. **Seen** — "This app understands what I'm going through."
2. **Permission** — "It's okay to feel this way. It's okay to stop."
3. **Capable** — "I have options. I'm not trapped."

### Emotions to Avoid

- **Judgment** — No "you should be doing more"
- **Clinical coldness** — No medical/sterile feeling
- **Complexity overwhelm** — No "figure this out yourself"

### Micro-Emotions & Design Implications

| Micro-Emotion | Design Implication |
|---------------|-------------------|
| **Trust** | Consistent, predictable behavior. No surprises. |
| **Safety** | Soft colors, rounded corners, gentle transitions. |
| **Validation** | Copy that acknowledges difficulty before offering help. |
| **Relief** | Ideas that give permission, not just advice. |

### Emotional Design Principles

1. **Acknowledge Before Advise** — Every idea starts with validation ("This is hard...")
2. **Soft Everything** — Rounded corners, gentle gradients, eased animations
3. **No Exclamation Points** — Calm typography, no urgency in the UI
4. **Breathing Room** — Generous whitespace, nothing crowded

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

| App | What They Nail | Relevance to gentle_loop |
|-----|----------------|-------------------------|
| **Calm / Headspace** | Immediate calm upon opening. Soft colors, gentle animations, breathing room. | Anchor Screen philosophy, transition animations |
| **Daylio** | One-tap mood logging with colors/icons. No typing required. | Energy Check interaction pattern |
| **WeCroak** | Ultra-minimal. Just a quote and a moment. Nothing else. | Anchor Screen simplicity |
| **Emergency SOS Apps** | Big buttons, zero ambiguity, works under stress. | Crisis-state usability |

### Transferable UX Patterns

| Source | Pattern | Application |
|--------|---------|-------------|
| Calm/Headspace | Breathing animation on load | Anchor Screen fades in with gentle pulse |
| Calm/Headspace | Soft gradient backgrounds | Sunset palette as ambient background |
| Daylio | One-tap mood icons | Energy Check: tap twilight/rose/gold |
| Daylio | Color = emotion | Screen tints based on selected state |
| WeCroak | Radical minimalism | ONE photo, ONE affirmation on Anchor |
| WeCroak | Quote-first, action-second | Idea as gentle card, not demanding popup |
| Emergency SOS | Large, obvious buttons | Big, thumb-friendly energy states |
| Emergency SOS | Works under stress | No nested menus, no confirmations |

### Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Gamification (streaks, points) | Adds guilt. "I missed a day" = failure. |
| Onboarding carousels | 5 swipes before value = abandoned app. |
| Bottom tab bars with 5+ icons | Too many choices during crisis. |
| Bright notification badges | Red dots = anxiety, not calm. |
| 10-option mood selectors | Decision fatigue. Three states max. |

### Design Inspiration Strategy

**Adopt:**
- Calm's breathing transitions
- Daylio's one-tap color logging
- WeCroak's radical simplicity

**Adapt:**
- Emergency SOS big buttons → soften with rounded corners + sunset colors
- Headspace ambient backgrounds → subtle energy-state tinting

**Avoid:**
- Any gamification or streak tracking
- Complex onboarding flows
- Dense navigation patterns

## Design System Foundation

### Design System Choice

**Themeable System: React Native Paper (or Tamagui)**

A pre-built, accessible component library with deep customization support for React Native.

### Rationale

1. **Speed for MVP** — Proven components reduce development time
2. **Full Themability** — Sunset palette + soft aesthetic can be applied globally
3. **Accessibility First** — Built-in screen reader support critical for stressed users
4. **React Native Native** — No performance compromises from web-first libraries

### Implementation Approach

1. Install base library (React Native Paper or Tamagui)
2. Define custom theme with sunset palette tokens
3. Override global styles (border-radius, spacing, typography)
4. Build custom components for unique screens (Anchor, Energy Check)

### Customization Strategy

| Element | Default | Our Override |
|---------|---------|--------------|
| Border Radius | 4px | 16-24px (soft) |
| Spacing | 8px base | 12-16px base (breathing room) |
| Colors | Material palette | Sunset gradient tokens |
| Typography | System default | Soft, rounded sans-serif |
| Transitions | 200ms | 400-600ms (gentle) |

## Defining Experience

### The Core Interaction

**"Open the app. Feel calmer in 60 seconds."**

The defining experience is immediate emotional regulation—not task completion, not tracking, not optimization. A caregiver opens the app feeling overwhelmed and closes it feeling *reset*.

### User Mental Model

Users arrive in crisis—not just stressed. They expect:
- Immediate relief without setup
- Validation before advice
- Permission to pause
- Respect for their limited time and cognitive capacity

They do NOT expect to learn, configure, or perform.

### Success Criteria

| Criteria | Target |
|----------|--------|
| Instant Value | Relief before configuration |
| Zero Learning | Works on first open |
| Permission Granted | Validation, not judgment |
| Time Respected | ≤60 seconds to regulation |
| Crisis Capable | Functions when user can barely think |

### Pattern Strategy

**Established Patterns:**
- Photo/image as emotional anchor
- Color-based state selection
- Card-based content delivery

**Our Innovation:**
- Anchor-first (comfort before questions)
- Energy framing (capacity, not mood)
- Ideas as permission (not instruction)
- Crisis detection (auto-simplify when overwhelmed)

### Experience Mechanics

| Phase | What Happens |
|-------|--------------|
| **Initiation** | App opens directly to Anchor Screen with user-chosen image (nature default, personal photo opt-in) |
| **Crisis Detection** | If no interaction for 5+ seconds, app stays on anchor with breathing pulse—no prompts |
| **Interaction** | Energy Check fades in gently; user taps one sunset-colored state (or skips) |
| **Feedback** | Screen tints; contextual idea card appears as an *offer*, not instruction |
| **Completion** | User feels seen, reset. Can dismiss, explore, or simply close. |

### Design Principles (from User Research)

| Principle | Implementation |
|-----------|----------------|
| **Flexible Anchor** | Default is calming abstract image; loved one's photo is opt-in, not required |
| **Optional Ideas** | Idea can be dismissed, skipped, or replaced—never mandatory |
| **Patient Interface** | App waits for the caregiver; no timeouts, no pressure to proceed |
| **Idea Validation** | Every idea must be doable in <2 minutes without leaving current location |
| **No Guilt** | App never acknowledges gaps in usage; every open feels like first open |
| **Discreet Aesthetic** | Looks like checking a text, not using a "wellness app" |
| **Crisis-First Design** | Designed for shaking hands and blurred vision, not just "stressed" |

## Visual Design Foundation

### Color System

**Primary Palette: Sunset Gradient**

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--energy-resting` | Twilight Purple | #6B5B7A | Low energy state, full-screen tint |
| `--energy-warming` | Dusty Rose | #C4A4A4 | Medium energy state, full-screen tint |
| `--energy-glowing` | Golden Hour Amber | #E8C47C | High energy state, full-screen tint |
| `--bg-primary` | Warm Cream | #FAF8F5 | Default app background |
| `--text-primary` | Warm Charcoal | #3D3A38 | Body text |
| `--surface` | Muted Lavender | #E8E4EC | Cards, surfaces |
| `--success` | Sage | #A8B89C | Positive feedback |

**Screen Tinting:** When user selects an energy state, the entire screen background subtly shifts to that color—immersive but not overwhelming.

**Color Philosophy:** Warm, natural, non-clinical. All three energy states are equally beautiful—no state feels like failure.

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
| `--text-energy` | 20px | 500 | Energy state labels |
| `--text-idea` | 18px | 400 | Idea content |
| `--text-body` | 16px | 400 | General text |
| `--text-caption` | 14px | 400 | Supporting info |

**Typography Philosophy:** Nothing too small. Nothing that requires squinting. Clear is the only priority.

### Spacing & Layout Foundation

**Base Unit:** 12px

**Spacing Scale:**
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 12px
- `--space-lg`: 24px
- `--space-xl`: 48px

**Layout Principles:**
1. **Very airy** — meditation-app minimal feel
2. One primary focus per screen
3. 48px minimum touch targets
4. 24px minimum margins
5. Energy buttons stacked vertically (easy thumb navigation)

**Layout Philosophy:** The app should feel like a deep breath—nothing crowded, nothing competing for attention.

### Animation Strategy

| Context | Animation |
|---------|-----------|
| **Anchor Screen** | Gentle breathing pulse (subtle, calming rhythm) |
| **Transitions** | Soft fades (400-600ms) |
| **Energy selection** | Smooth screen tint transition |
| **Everything else** | Minimal—simple to look at and understand |

**Animation Philosophy:** Gentle presence, not distraction. The pulse invites a breath; it doesn't demand attention.

### Accessibility Considerations

| Need | Implementation |
|------|----------------|
| Low vision | Large text, high contrast (WCAG AA 4.5:1) |
| Shaky hands | 48px+ tap targets, stacked vertical buttons |
| Color blindness | Energy states labeled with words + color |
| Motion sensitivity | Reduce motion option disables pulse/animations |
| System scaling | Respects user's system font size preferences |

## Onboarding Flow

### Flow Summary

| Step | Content | Required? |
|------|---------|-----------|
| 1. Welcome | What the app is, core value prop | Yes |
| 2. How It Works | Quick visual demo of the loop | Yes |
| 3. Your Name | Simple text entry | Yes |
| 4. Your Anchor | Photo/video upload OR skip with default | Optional (skippable) |
| 5. → Anchor Screen | Begin using the app | — |

**Key Principle:** Onboarding is *setup*, not *value*. Value starts at Anchor Screen.

**Skippable Personalization:** Users can skip photo upload during onboarding. Clear signpost shows where to customize later in Settings.

## Ideas Framework

### Language Philosophy: Softer, Warmer, Human

The app uses intentionally soft language. "Strategies" felt too clinical and formal—like a training manual. Instead, we use **Ideas**—helpful thoughts that feel like a friend offering a suggestion, not a professional dispensing advice.

**Key Language Decisions:**
- **Button:** "I could use some ideas" (stating a need, caregiver-centered)
- **Actions:** "Something else" / "That helps" (not "Another" / "Done")
- **No category labels** — Just validation + title + idea
- **No source citations** — Trust comes from the app feeling helpful, not from citing research

### What the Caregiver Needs by Energy State

| Energy State | How They're Feeling | What Helps |
|--------------|---------------------|------------|
| **Resting (Low)** | Running on empty | Permission, settling, self-care |
| **Warming (Medium)** | Holding steady | Practical tools for the moment |
| **Glowing (High)** | Some capacity | Setting up for success |

### Ideas: When You're Running on Empty (Resting)

*Focus: Giving yourself permission*

| Title | Idea |
|-------|------|
| Feel your feet on the floor | Name 5 things you can see. 4 you can touch. 3 you can hear. This tells your body it's safe. |
| Say it out loud | "I'm doing the best I can. I can't control everything." Your brain believes what it hears you say. |
| Try this breath | In for 4. Out for 6. The longer exhale tells your body it's safe. Do it three times. |
| Find a familiar scent | Coffee, a lotion you love, fresh air. Something that brings you back to yourself. |

### Ideas: When You're Holding Steady (Warming)

*Focus: Tools for the moment you're in*

| Title | Idea |
|-------|------|
| Feelings before fixing | Try "I can see you're upset" before solving anything. Validation opens doors. |
| Change the scene | If they're stuck in a loop, move somewhere else. Movement breaks thought patterns. |
| Show instead of tell | Hold up the mug instead of saying "coffee." Visuals often land when words don't. |
| Check the basics | Hungry? Thirsty? In pain? Need bathroom? Too hot or cold? Behavior is often trying to tell you something. |
| Lower and slower | Speak slower and lower. A calm tone signals safety. |
| One question at a time | "Are you cold?" works. "Do you want a sweater or blanket?" overwhelms. |

### Ideas: When You've Got Some Capacity (Glowing)

*Focus: Setting yourself up*

| Title | Idea |
|-------|------|
| Set up the space | Good moment to reduce clutter, label things. A calmer space means fewer hard moments. |
| Same time, same way | Routines reduce anxiety. Write down what works and repeat it. |
| Note what's working | What music helped? What phrase landed? Future you will thank present you. |
| When did you last ask for help? | Even 2 hours away helps you show up better. Who could you reach out to? |
| Try a photo or song | Familiar music can shift the mood even when words don't land. |
| Set up tomorrow tonight | Lay out clothes. Prep breakfast. Small things now mean fewer decisions when tired. |

### Idea Card Format

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

**Card Elements:**
1. **Validation** (italic, smaller) — Acknowledges where they are
2. **Title** (bold) — A gentle prompt, not a category
3. **Idea** (regular) — Conversational, actionable, warm
4. **Actions** — "Something else" to get another, "That helps" to dismiss

### Idea Delivery Rules

1. **Always Validate First** — Every card opens with acknowledgment of how hard this is
2. **Match Energy State** — Only show ideas appropriate to current capacity
3. **Doable in 2 Minutes** — Nothing that requires leaving or complex setup
4. **Conversational Tone** — Like a friend, not a textbook
5. **"Something Else" Option** — User can request different idea without friction
6. **No Judgment** — Every idea is offered gently; none are mandatory
