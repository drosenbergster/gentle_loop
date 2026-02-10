# Wireframes Specification - gentle_loop

**Version:** 2.0
**Date:** 2026-02-09
**Updated:** Reflects PRD v2026-02-07 (mic-first Anchor Screen, AI suggestion card with 4 actions, timer flow, conversation threading)

---

## Screen Inventory

| Screen | Purpose | Entry Point |
|--------|---------|-------------|
| **Anchor Screen** | Primary emotional reset + mic input | App launch, after onboarding |
| **Recording Overlay** | Visual feedback during hold-to-talk | Mic button press-and-hold |
| **Processing Overlay** | AI thinking indicator | After recording release |
| **AI Suggestion Card** | AI response with 4 actions | After AI processes input |
| **Timer / Breathing UI** | Pause timer for "running low" flow | After AI suggests a pause |
| **Offline Ideas Card** | Curated fallback ideas | Grayed mic tap (no network) |
| **Onboarding (5 screens)** | Setup and personalization | First launch only |
| **Settings** | Energy, Toolbox, preferences | Settings icon tap |

---

## 1. Anchor Screen

### Purpose
The Anchor Screen is the app's emotional home. Three elements only: anchor image, affirmation, mic button. The energy slider has moved to Settings to keep this screen maximally calm.

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                    ⚙️   │  ← Header: 56px, settings only
│                                         │
│                                         │
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │   ANCHOR IMAGE    │           │  ← Anchor Zone: 40% of screen
│         │   (with gentle    │           │
│         │    breathing      │           │
│         │    pulse)         │           │
│         │                   │           │
│         └───────────────────┘           │
│                                         │
│    "You're doing harder work than       │  ← Affirmation: 28px Poppins
│     most people will ever know."        │
│                                         │
│                                         │
│                                         │
│              ┌────────┐                 │
│              │        │                 │
│              │   🎤   │                 │  ← Mic Button: 80x80px
│              │        │                 │     Primary interaction
│              └────────┘                 │
│             ⌨️                           │  ← Text input icon: 24px, subtle
│                                         │
│                                         │  ← Bottom safe area: 34px
└─────────────────────────────────────────┘
```

### Component Details

#### Header Bar
| Property | Value |
|----------|-------|
| Height | 56px |
| Background | Transparent (inherits screen tint) |
| Right: Settings icon | 24x24px, `--text-primary` |
| No left icon | Menu removed — minimal screen |

#### Anchor Image Zone
| Property | Value |
|----------|-------|
| Size | 280x280px (scales with screen) |
| Shape | Rounded rectangle, 24px radius |
| Default | Calming nature image (mountains, water) |
| Custom | User-uploaded photo |
| Animation | Gentle scale pulse: 1.0 → 1.02 → 1.0, 4-second cycle |
| Shadow | Subtle drop shadow, 8px blur, 10% opacity |

#### Affirmation Text
| Property | Value |
|----------|-------|
| Font | Poppins, 28px, weight 500 |
| Color | `--text-primary` (warm charcoal) |
| Alignment | Center |
| Max width | 320px |
| Margin top | 24px from image |
| Content | Rotates from curated list; adapts to energy level |

#### Mic Button (Hero Element)
| Property | Value |
|----------|-------|
| Size | 80x80px (minimum tap target: 64x64pt) |
| Shape | Circle |
| Background | Energy state color (dynamic) |
| Icon | Microphone, 32px, white |
| Shadow | 8px blur, 20% opacity |
| Position | Centered, below affirmation |
| Margin top | 48px from affirmation |
| Interaction | Hold-to-talk (finger down = record, finger up = send) |
| Offline state | Grayed out, 50% opacity |

#### Text Input Icon (Secondary)
| Property | Value |
|----------|-------|
| Size | 24x24px icon, 44x44px tap area |
| Position | Below mic button, centered, subtle |
| Color | `--text-muted` (50% opacity) |
| Icon | Keyboard icon |
| Interaction | Tap to open text input field |

### Screen States

#### Default (Resting)
- Background: `--bg-primary` with subtle energy tint (8% opacity)
- All three elements visible: image, affirmation, mic
- Breathing pulse active on anchor image

#### Offline (No Network)
- Mic button grayed out (50% opacity)
- Tapping mic shows brief toast: "AI isn't available offline"
- After toast, curated Gentle Ideas overlay opens automatically
- All other elements unchanged

#### Crisis Detection (5+ seconds no interaction)
- Mic button fades to 30% opacity
- Text input icon fades out
- Only visible: Anchor image + breathing pulse + affirmation
- Any tap restores full UI

### Interaction Behaviors

| Action | Response |
|--------|----------|
| App opens | Anchor image fades in (600ms), pulse begins |
| Hold mic button | → Recording Overlay |
| Release mic button | → Processing Overlay |
| Tap mic (offline) | Toast message → Gentle Ideas overlay |
| Tap text input icon | Text input field slides up from bottom |
| Tap settings icon | Navigate to Settings screen |
| No interaction (5s) | Graceful fade to crisis-calm state |
| Any tap in crisis state | Full UI fades back in |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Screen reader | "Anchor image. [Affirmation text]. Hold microphone button to describe your situation." |
| Mic a11y | "Microphone button. Press and hold to record." |
| Touch target | Mic: 80x80px. Settings: 48x48px. Text input: 44x44px. |
| Reduce motion | Disables breathing pulse, instant transitions |
| High contrast | 4.5:1 ratio on all text and icons |

---

## 2. Recording Overlay

### Purpose
Visual feedback while the caregiver holds the mic button and speaks. The anchor image stays visible — they're talking to their anchor, not to a machine.

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                    ⚙️   │
│                                         │
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │   ANCHOR IMAGE    │           │  ← Still visible (slightly dimmed)
│         │   (dimmed 20%)    │           │
│         │                   │           │
│         └───────────────────┘           │
│                                         │
│    "You're doing harder work than..."   │  ← Affirmation still visible
│                                         │
│                                         │
│         Listening...                    │  ← Status label: 16px, faded
│                                         │
│              ┌────────┐                 │
│              │ ◉◉◉◉◉  │                 │  ← Mic: Pulsing ring animation
│              │   🎤   │                 │     80x80px, ring expands to 96px
│              │ ◉◉◉◉◉  │                 │
│              └────────┘                 │
│                                         │
│    "She won't take her meds ag..."      │  ← Live transcription (optional)
│                                         │     16px, appears as spoken
│                                         │
└─────────────────────────────────────────┘
```

### Component Details

| Property | Value |
|----------|-------|
| Overlay background | None (transparent, anchor visible) |
| Anchor dim | 20% darker overlay on image only |
| Mic animation | Pulsing ring: 80px → 96px → 80px, 1s loop |
| Ring color | Energy state color at 40% opacity |
| Status label | "Listening...", Poppins 16px, `--text-secondary` |
| Transcription | Optional live text, 16px, appears word-by-word |
| Max duration | 60 seconds (auto-stop) |
| Duration indicator | Subtle progress arc around mic (optional) |

### Interaction Behaviors

| Action | Response |
|--------|----------|
| Finger held down | Recording continues, pulse animates |
| Finger released | → Processing Overlay |
| 60 seconds reached | Auto-stop, → Processing Overlay |

---

## 3. Processing Overlay

### Purpose
Brief transition state while transcription and AI generation happen. Keeps the caregiver calm — they see the anchor, they see something happening.

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                    ⚙️   │
│                                         │
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │   ANCHOR IMAGE    │           │  ← Still visible
│         │                   │           │
│         └───────────────────┘           │
│                                         │
│    "You're doing harder work than..."   │
│                                         │
│                                         │
│                                         │
│              ● ● ●                      │  ← Pulsing ellipsis
│                                         │     Gentle fade in/out cycle
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Component Details

| Property | Value |
|----------|-------|
| Ellipsis dots | 3 circles, 8px each, spaced 12px apart |
| Animation | Sequential fade: each dot fades 0.3 → 1.0 → 0.3 in sequence |
| Dot color | Energy state color |
| Position | Where the mic button was (centered) |
| Duration | Target: <5 seconds total |

---

## 4. AI Suggestion Card

### Purpose
Delivers the AI's suggestion with four action options. This is the heart of the AI Guided Support interaction.

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌───────────────────┐           │
│         │   ANCHOR IMAGE    │           │  ← Visible behind card (dimmed)
│         │   (dimmed 40%)    │           │
│         └───────────────────┘           │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ────────────────────────────────  │  │  ← Drag indicator: 4x40px
│  │                                    │  │
│  │  "Try offering something she can  │  │  ← Suggestion text: 18px Poppins
│  │   eat with her hands — crackers,  │  │     Max ~40 words
│  │   fruit, cheese. Sometimes the    │  │
│  │   format is the problem, not      │  │
│  │   the food."                      │  │
│  │                                    │  │
│  │  ┌────────────────────────────┐   │  │
│  │  │      ✓ That worked         │   │  │  ← Primary action: Sage green
│  │  └────────────────────────────┘   │  │     48px height, full width
│  │                                    │  │
│  │  ┌──────────┐  ┌──────────┐       │  │
│  │  │ Dismiss  │  │ Another  │  🎤   │  │  ← Secondary row: 44px height
│  │  └──────────┘  └──────────┘       │  │     Mic button: 44px circle
│  │                                    │  │
│  │  AI-generated                      │  │  ← Label: 11px, muted
│  │                                    │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Component Details

#### Card Container
| Property | Value |
|----------|-------|
| Width | 100% screen width |
| Height | Auto, max 60% of screen |
| Background | `--surface` (#E8E4EC) or White |
| Border radius | 24px (top corners only) |
| Shadow | 0 -4px 20px rgba(0,0,0,0.15) |
| Entry animation | Slide up from bottom, 400ms ease-out |
| Position | Bottom of screen |

#### Drag Indicator
| Property | Value |
|----------|-------|
| Size | 4px height × 40px width |
| Color | `--text-primary` at 30% opacity |
| Position | Center, 12px from top |
| Purpose | Indicates swipe-right-to-dismiss |

#### Suggestion Text
| Property | Value |
|----------|-------|
| Font | Poppins, 18px, weight 400 |
| Line height | 1.5 |
| Color | `--text-primary` |
| Padding | 24px horizontal, 20px top |
| Max words | ~40 (enforced by AI, not UI) |

#### "That Worked" Button (Primary)
| Property | Value |
|----------|-------|
| Width | 100% (minus padding) |
| Height | 48px |
| Background | `--success` (Sage #A8B89C) |
| Border radius | 9999px (full pill) |
| Text | "That worked", 16px, weight 500, white |
| Margin top | 20px |

#### Secondary Action Row
| Property | Value |
|----------|-------|
| Layout | Flex row, space-between, centered |
| Margin top | 12px |
| Padding bottom | 24px + safe area |

**"Dismiss" Button**
| Property | Value |
|----------|-------|
| Width | 38% |
| Height | 44px |
| Background | Transparent |
| Border | 1.5px solid `--text-muted` |
| Border radius | 9999px |
| Text | "Dismiss", 15px, weight 400, `--text-secondary` |

**"Another" Button**
| Property | Value |
|----------|-------|
| Width | 38% |
| Height | 44px |
| Background | Transparent |
| Border | 1.5px solid energy-state-color |
| Border radius | 9999px |
| Text | "Another", 15px, weight 500, energy-state-color |

**Mic Button (Follow-up)**
| Property | Value |
|----------|-------|
| Size | 44x44px circle |
| Background | Energy state color |
| Icon | Microphone, 20px, white |
| Position | Right side of secondary row |
| Interaction | Hold-to-talk (same as Anchor Screen mic) |

#### AI-Generated Label
| Property | Value |
|----------|-------|
| Font | Poppins, 11px, weight 400 |
| Color | `--text-muted` (50% opacity) |
| Position | Bottom-left of card, inside padding |

### Card Variants

#### With "Still With You" Encouragement
When the encouragement banner is active (after 2+ cycles without "That worked"):

```
┌───────────────────────────────────────────┐
│                                           │
│  "Still here with you. Let's try a        │  ← Encouragement: 15px italic
│   different angle."                       │     Dusty rose background (10%)
│                                           │     Fades after 3-4 seconds
├───────────────────────────────────────────┤
│                                           │
│  "Try putting on music she used to love.  │  ← Normal suggestion card below
│   Musical memory often sticks around      │
│   longer than other kinds."               │
│                                           │
│  [✓ That worked]                          │
│  [Dismiss]  [Another]  🎤                 │
│                                           │
│  AI-generated                             │
│                                           │
└───────────────────────────────────────────┘
```

Encouragement banner:
| Property | Value |
|----------|-------|
| Background | Energy color at 10% opacity |
| Font | Poppins, 15px, weight 400, italic |
| Color | `--text-primary` at 80% |
| Padding | 12px horizontal, 8px vertical |
| Position | Above the suggestion card, same width |
| Animation | Fade in 300ms, auto-fade out after 3-4s |

#### Out of Ideas
When the AI signals no more suggestions:

```
┌───────────────────────────────────────────┐
│                                           │
│  "I've shared what I know for this one.   │  ← AI's honest acknowledgment
│   Check your Toolbox — something that's   │
│   worked before might fit here. Your      │
│   presence matters more than any          │
│   technique."                             │
│                                           │
│  [✓ That worked]                          │  ← Still available
│  [Dismiss]            🎤                  │  ← "Another" hidden
│                                           │
│  AI-generated                             │
│                                           │
└───────────────────────────────────────────┘
```

- "Another" button is hidden (not just disabled — removed)
- "Dismiss" expands to fill the gap
- Mic still available for new context / follow-up

---

## 5. Timer / Breathing Overlay

### Purpose
When the AI suggests a pause for a "running low" caregiver, the app displays a calming breathing timer before automatically providing a follow-up suggestion.

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         ┌───────────────────┐           │
│         │   ANCHOR IMAGE    │           │  ← Visible, not dimmed
│         │   (full color)    │           │
│         └───────────────────┘           │
│                                         │
│                                         │
│              ┌──────────┐               │
│              │          │               │
│              │    ◯     │               │  ← Breathing circle: 120px
│              │ (expand/ │               │     Gentle expand/contract
│              │ contract)│               │     4-second cycle
│              │          │               │
│              └──────────┘               │
│                                         │
│             1:12 remaining              │  ← Timer: 16px, muted
│                                         │
│           [ Skip ]                      │  ← Skip link: 14px, underline
│                                         │
└─────────────────────────────────────────┘
```

### Component Details

| Property | Value |
|----------|-------|
| Breathing circle | 120px, energy color stroke (2px), fill at 5% opacity |
| Animation | Scale 0.8 → 1.0 → 0.8, 4-second loop (matches breathing rhythm) |
| Timer text | Poppins 16px, `--text-muted`, "X:XX remaining" |
| Skip link | Poppins 14px, underline, `--text-secondary` |
| Duration | 90 seconds default |
| Anchor image | Full visibility — no dimming during breathing |

### Interaction Behaviors

| Action | Response |
|--------|----------|
| Timer expires | → Processing Overlay → Follow-up Suggestion Card |
| Tap "Skip" | Timer cancels → Processing Overlay → Follow-up Suggestion |
| Hold mic button | Timer cancels → Recording Overlay (manual follow-up) |
| Tap outside | No action — timer continues |

---

## 6. Text Input Fallback

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌───────────────────┐           │
│         │   ANCHOR IMAGE    │           │  ← Still visible
│         └───────────────────┘           │
│                                         │
│    "You're doing harder work than..."   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Describe what's happening...      │  │  ← Text input: 56px height
│  │                                   │  │     Poppins 16px
│  └───────────────────────────────────┘  │
│                                         │
│         ┌─────────────────────┐         │
│         │       Send          │         │  ← Submit button: 48px
│         └─────────────────────┘         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         KEYBOARD                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Component Details

| Property | Value |
|----------|-------|
| Input field | 56px height, rounded (16px), `--surface` background |
| Placeholder | "Describe what's happening..." |
| Submit button | Energy state color, "Send", 48px height |
| Keyboard | Standard system keyboard |
| Dismiss | Tap outside text field or swipe down to close |

---

## 7. Offline Ideas Card (Fallback)

### Purpose
When the AI is unavailable (no network), tapping the mic opens the curated ideas library. Same card format as the original design, with 2 actions.

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ────────────────────────────────  │  │  ← Drag indicator
│  │                                    │  │
│  │  "Running on empty is exhausting.  │  │  ← Validation: 16px italic
│  │   You're still showing up —        │  │
│  │   that matters."                   │  │
│  │                                    │  │
│  │  Feel your feet on the floor       │  │  ← Title: 22px bold
│  │                                    │  │
│  │  Name 5 things you can see.        │  │  ← Content: 16px
│  │  4 you can touch. 3 you can hear.  │  │
│  │  This tells your body it's safe.   │  │
│  │                                    │  │
│  │  ┌────────────┐  ┌────────────┐   │  │
│  │  │Something   │  │  That      │   │  │  ← Two actions
│  │  │  else      │  │  helps     │   │  │
│  │  └────────────┘  └────────────┘   │  │
│  │                                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Dimmed Anchor behind
└─────────────────────────────────────────┘
```

**Note:** This card has TWO actions (Something else / That helps), not four. It's the offline-only curated content, distinct from the AI suggestion card.

---

## 8. Onboarding Flow (Updated to 5 Steps)

### Flow Overview

```
[1. Welcome] → [2. How It Works] → [3. Your Name] → [4. Your Anchor] → [5. Meet the Mic] → [Anchor Screen]
```

### Screen 8.1: Welcome

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              🌅                         │  ← App icon: 80x80px
│                                         │
│         gentle_loop                     │  ← App name: 32px
│                                         │
│    A moment of calm when                │  ← Tagline: 20px
│    you need it most.                    │
│                                         │
│    This app is your personal            │  ← Description: 16px
│    reset button. Open it when           │
│    caregiving gets heavy. We'll         │
│    help you pause, breathe, and         │
│    find your next step.                 │
│                                         │
│                                         │
│         ┌─────────────────────┐         │
│         │     Get Started     │         │  ← CTA: 56px
│         └─────────────────────┘         │
│                                         │
│            ○ ○ ○ ○ ○                    │  ← 5 progress dots
└─────────────────────────────────────────┘
```

### Screen 8.2: How It Works

```
┌─────────────────────────────────────────┐
│                                         │
│         How it works                    │  ← Title: 28px
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [Mini anchor + mic illustration] │  │  ← 200px illustration
│  └───────────────────────────────────┘  │
│                                         │
│  1. Open the app                        │
│     See your anchor image. Take a       │
│     breath.                             │
│                                         │
│  2. Hold the mic                        │  ← UPDATED: mic, not slider
│     Describe what's happening. The      │
│     AI listens.                         │
│                                         │
│  3. Get a suggestion                    │  ← UPDATED: AI suggestion
│     A short, honest idea you can        │
│     try right now.                      │
│                                         │
│         ┌─────────────────────┐         │
│         │      Continue       │         │
│         └─────────────────────┘         │
│                                         │
│            ● ○ ○ ○ ○                    │
└─────────────────────────────────────────┘
```

### Screen 8.3: Your Name

```
┌─────────────────────────────────────────┐
│                                         │
│         What should we call you?        │  ← Title: 28px
│                                         │
│         This helps us personalize       │
│         your experience.                │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Your first name                  │  │  ← Input: 56px height
│  └───────────────────────────────────┘  │
│                                         │
│                                         │
│         ┌─────────────────────┐         │
│         │      Continue       │         │  ← Disabled until name entered
│         └─────────────────────┘         │
│                                         │
│            ● ● ○ ○ ○                    │
└─────────────────────────────────────────┘
```

### Screen 8.4: Your Anchor

```
┌─────────────────────────────────────────┐
│                                         │
│         Choose your anchor              │  ← Title: 28px
│                                         │
│         This image will greet you       │
│         every time you open the app.    │
│                                         │
│    ┌───────────┐  ┌───────────┐         │
│    │           │  │           │         │
│    │  Default  │  │  Upload   │         │  ← Two options: 140x140px
│    │  (nature) │  │  Photo    │         │
│    │     ✓     │  │    📷     │         │
│    └───────────┘  └───────────┘         │
│                                         │
│    You can change this anytime in       │
│    Settings.                            │
│                                         │
│         ┌─────────────────────┐         │
│         │      Continue       │         │
│         └─────────────────────┘         │
│                                         │
│    Skip for now                         │  ← Skip link
│                                         │
│            ● ● ● ○ ○                    │
└─────────────────────────────────────────┘
```

### Screen 8.5: Meet the Mic (NEW)

```
┌─────────────────────────────────────────┐
│                                         │
│         Meet the mic                    │  ← Title: 28px
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │     [Hold-to-talk animation]      │  │  ← Animated hand + mic
│  │     Finger down → pulsing →       │  │     200px illustration
│  │     finger up                     │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  When you need help, hold the mic       │  ← Instructions: 16px
│  and describe what's happening.         │
│  The AI will give you a short,          │
│  honest suggestion you can try          │
│  right now.                             │
│                                         │
│  🔒 Audio is never stored.              │  ← Privacy note: 14px
│  Your voice is converted to text        │
│  and immediately discarded.             │
│                                         │
│         ┌─────────────────────┐         │
│         │   Allow Microphone  │         │  ← Triggers permission dialog
│         └─────────────────────┘         │
│                                         │
│  ☐ I understand this is a wellness      │  ← Disclaimer checkbox
│    tool, not a medical device.          │     Required to proceed
│                                         │
│            ● ● ● ● ○                    │
└─────────────────────────────────────────┘
```

### Onboarding Specifications

| Element | Specification |
|---------|---------------|
| Background | `--bg-primary` (warm cream) |
| Progress dots | 8px circles, active = `--energy-warming`, 5 dots total |
| Navigation | Swipe OR button tap |
| Skip option | Only on "Your Anchor" screen |
| Total time | Target: < 90 seconds (added mic step) |
| Exit point | Directly to Anchor Screen |

---

## 9. Settings Screen (Updated)

### Layout Specification

```
┌─────────────────────────────────────────┐
│ ←  Settings                             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ YOUR ENERGY                       │  │  ← NEW section
│  │ ─────────────────────────────────  │  │
│  │                                   │  │
│  │ ═══════════════════════════○      │  │  ← Energy slider (gradient)
│  │ Running low  Holding steady  Got  │  │     Same as old Anchor slider
│  │                             this  │  │
│  │                                   │  │
│  │ Helps the AI adjust its tone.     │  │  ← Helper: 13px, muted
│  │ Set whenever you think to.        │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ TOOLBOX                           │  │  ← NEW section
│  │ ─────────────────────────────────  │  │
│  │                                   │  │
│  │ "Try finger foods on a bright     │  │  ← Toolbox entry
│  │  plate" — Saved Feb 1             │  │
│  │                                   │  │
│  │ "Play Frank Sinatra during bath   │  │
│  │  time" — Saved Jan 28             │  │
│  │                                   │  │
│  │ "Gentle back scratch during       │  │
│  │  spirals" — Saved Jan 25          │  │
│  │                                   │  │
│  │ View All →                        │  │  ← Expands to full Toolbox
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ PERSONALIZATION                   │  │
│  │ ─────────────────────────────────  │  │
│  │ Your Name                    [→]  │  │
│  │ Anchor Image                 [→]  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ AI RESPONSE                       │  │  ← NEW section
│  │ ─────────────────────────────────  │  │
│  │ Response Mode              [Both] │  │  ← Picker: Text / Audio / Both
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ACCESSIBILITY                     │  │
│  │ ─────────────────────────────────  │  │
│  │ Reduce Motion              [OFF]  │  │
│  │ Larger Text                [OFF]  │  │
│  │ High Contrast              [OFF]  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ABOUT                             │  │
│  │ ─────────────────────────────────  │  │
│  │ Version                    1.0.0  │  │
│  │ Privacy Policy               [→]  │  │
│  │ Send Feedback                [→]  │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Settings Specifications

| Element | Specification |
|---------|---------------|
| Section headers | 12px uppercase, `--text-primary` at 60% |
| Row height | 64px minimum |
| Row padding | 16px horizontal |
| Toggle switches | 51x31px, iOS-style |
| Toggle active | Energy state color |
| Dividers | 1px, `--text-primary` at 10% |
| Navigation | Back arrow returns to Anchor Screen |
| Energy slider | Same gradient track as before (purple → rose → gold) |
| Response mode | Segmented control or picker |
| Toolbox preview | Shows 3 most recent, "View All" expands |
| Toolbox swipe | Swipe left to reveal delete action |

---

## Responsive Considerations

### Screen Size Adaptations

| Screen Size | Adaptations |
|-------------|-------------|
| **Small (< 375px)** | Anchor image 240px, mic 72px, reduced margins |
| **Standard (375-414px)** | Default specifications |
| **Large (> 414px)** | Anchor image 320px, mic 88px, increased spacing |
| **Tablet** | Center content, max-width 500px |

### Safe Areas

| Area | Specification |
|------|---------------|
| Top | Respect notch/dynamic island |
| Bottom | 34px home indicator padding |
| Landscape | Not supported (portrait lock) |

---

## Animation Specifications

### Transitions

| Transition | Duration | Easing |
|------------|----------|--------|
| Screen background tint | 400ms | ease-in-out |
| Suggestion card slide up | 400ms | ease-out |
| Suggestion card dismiss | 300ms | ease-in |
| Content cross-fade | 300ms | ease-in-out |
| Anchor image fade-in | 600ms | ease-out |
| Encouragement fade in | 300ms | ease-in |
| Encouragement auto-fade | 3000ms | ease-out |

### Micro-interactions

| Element | Animation |
|---------|-----------|
| Anchor breathing pulse | scale 1.0 → 1.02 → 1.0, 4s loop |
| Mic recording ring | pulsing ring 80px → 96px → 80px, 1s loop |
| Processing ellipsis | sequential dot fade, 1.5s cycle |
| Button press | scale 0.98, 100ms |
| Breathing timer circle | scale 0.8 → 1.0 → 0.8, 4s loop |
| Swipe dismiss | translate-x + opacity, 300ms |

### Reduce Motion Mode

When enabled:
- No breathing pulse
- No recording ring animation
- Instant state changes (no fades)
- No scale animations
- Slide animations replaced with fade
- Timer shows countdown only (no breathing circle animation)
