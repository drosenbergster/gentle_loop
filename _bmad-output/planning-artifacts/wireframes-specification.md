# Wireframes Specification - gentle_loop

**Version:** 1.0  
**Date:** 2026-02-04

---

## Screen Inventory

| Screen | Purpose | Entry Point |
|--------|---------|-------------|
| **Anchor Screen** | Primary emotional reset interface | App launch, after onboarding |
| **Strategy Card** | Evidence-based guidance delivery | "Show me a strategy" tap |
| **Onboarding (4 screens)** | Setup and personalization | First launch only |
| **Settings** | Customization and preferences | Settings icon tap |

---

## 1. Anchor Screen

### Purpose
The Anchor Screen is the app's emotional home. It's what caregivers see every time they open the app—designed to trigger an immediate pause and breath before any interaction.

### Layout Specification

```
┌─────────────────────────────────────────┐
│ ≡                              ⚙️  🎤   │  ← Header: 56px
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
│    "You're doing harder work than       │  ← Affirmation: 32px Poppins
│     most people will ever know."        │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ ════════════════════════════════○  │ │  ← Energy Slider
│  │  Resting    Warming    Glowing     │ │     Height: 64px
│  └────────────────────────────────────┘ │
│                                         │
│         ┌─────────────────────┐         │
│         │  Show me a strategy │         │  ← Primary CTA: 56px height
│         └─────────────────────┘         │
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
| Left: Menu icon | 24x24px, `--text-primary` |
| Right: Settings icon | 24x24px, `--text-primary` |
| Right: Mic icon | 24x24px, accent color, always visible |

#### Anchor Image Zone
| Property | Value |
|----------|-------|
| Size | 280x280px (scales with screen) |
| Shape | Rounded rectangle, 24px radius |
| Default | Calming nature image (mountains, water) |
| Custom | User-uploaded photo or video thumbnail |
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
| Content | Rotates from curated list on each app open |

#### Energy Slider
| Property | Value |
|----------|-------|
| Container height | 64px |
| Track height | 8px |
| Track background | Linear gradient (purple → rose → amber) |
| Thumb size | 32px circle |
| Thumb color | White with subtle shadow |
| Labels | "Resting" / "Warming" / "Glowing" below track |
| Label font | Poppins, 14px, weight 400 |
| Interaction | Drag thumb OR tap anywhere on track |

#### Primary CTA Button
| Property | Value |
|----------|-------|
| Width | 80% of screen (max 320px) |
| Height | 56px |
| Background | Dynamic based on energy state |
| Border radius | 28px (pill shape) |
| Text | "Show me a strategy" |
| Font | Poppins, 18px, weight 500 |
| Shadow | 4px blur, 15% opacity |

### Screen States

#### Default State (App Launch)
- Background: `--bg-primary` (warm cream #FAF8F5)
- Energy slider: Centered position (Warming)
- Button color: `--energy-warming` (dusty rose)

#### Resting State (Low Energy)
- Background tint: Soft purple overlay (15% opacity)
- Slider thumb: Left position
- Button: `--energy-resting` (twilight purple)
- Affirmation pool: Permission-focused ("It's okay to rest...")

#### Warming State (Medium Energy)
- Background tint: Soft rose overlay (15% opacity)
- Slider thumb: Center position
- Button: `--energy-warming` (dusty rose)
- Affirmation pool: Supportive ("You're holding steady...")

#### Glowing State (High Energy)
- Background tint: Soft amber overlay (15% opacity)
- Slider thumb: Right position
- Button: `--energy-glowing` (golden amber)
- Affirmation pool: Encouraging ("You've got this...")

#### Crisis Detection State
*Triggered after 5+ seconds of no interaction*
- Energy slider: Fades out
- CTA button: Fades out
- Only visible: Anchor image + breathing pulse
- No prompts, no pressure

### Interaction Behaviors

| Action | Response |
|--------|----------|
| App opens | Anchor image fades in (600ms), then pulse begins |
| Slider drag | Real-time background tint change |
| Slider release | Button color updates, affirmation may change |
| Tap on track | Thumb animates to tap position |
| Tap "Show me a strategy" | Strategy Card slides up from bottom |
| Tap mic icon | Voice input modal appears |
| No interaction (5s) | Graceful fade to crisis state |
| Any tap in crisis state | Full UI fades back in |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Screen reader | "Anchor image showing [description]. Energy level: [state]" |
| Slider a11y | Slider announces "Energy level: Resting/Warming/Glowing" |
| Touch targets | All icons ≥48x48px tap area |
| Reduce motion | Disables breathing pulse, instant transitions |
| High contrast | Ensure 4.5:1 ratio on all text |

---

## 2. Strategy Card

### Purpose
Delivers evidence-based, contextual guidance based on the caregiver's selected energy state. Designed to validate first, then offer actionable support.

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ────────────────────────────────  │  │  ← Drag indicator: 4x40px
│  │                                    │  │
│  │  "Running on empty is exhausting.  │  │  ← Validation: italic
│  │   You're still showing up —        │  │     16px Poppins
│  │   that matters."                   │  │
│  │                                    │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │ BREATHING RESET              │  │  │  ← Category: 12px caps
│  │  │ ────────────────────────────  │  │  │
│  │  │ Extended Exhale              │  │  │  ← Title: 22px bold
│  │  │                              │  │  │
│  │  │ Breathe in for 4 counts.     │  │  │  ← Content: 16px
│  │  │ Out for 6 counts. The longer │  │  │
│  │  │ exhale activates your vagus  │  │  │
│  │  │ nerve and signals safety to  │  │  │
│  │  │ your body.                   │  │  │
│  │  │                              │  │  │
│  │  │ ──────────────────────────── │  │  │
│  │  │ Source: Autonomic nervous    │  │  │  ← Source: 13px, muted
│  │  │ system regulation            │  │  │
│  │  └──────────────────────────────┘  │  │
│  │                                    │  │
│  │  ┌────────────┐  ┌────────────┐   │  │
│  │  │  Another   │  │    Done    │   │  │  ← Action buttons
│  │  └────────────┘  └────────────┘   │  │
│  │                                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Dimmed Anchor Screen behind
└─────────────────────────────────────────┘
```

### Component Details

#### Card Container
| Property | Value |
|----------|-------|
| Width | 100% screen width |
| Height | Auto (content-based), max 85% screen |
| Background | `--surface` (#E8E4EC) or White |
| Border radius | 24px (top corners only) |
| Shadow | 0 -4px 20px rgba(0,0,0,0.15) |
| Entry animation | Slide up from bottom, 400ms ease-out |

#### Drag Indicator
| Property | Value |
|----------|-------|
| Size | 4px height × 40px width |
| Color | `--text-primary` at 30% opacity |
| Position | Center, 12px from top |
| Purpose | Indicates swipe-to-dismiss |

#### Validation Section
| Property | Value |
|----------|-------|
| Font | Poppins, 16px, weight 400, italic |
| Color | `--text-primary` at 80% opacity |
| Padding | 24px horizontal, 16px top |
| Max lines | 3 |

#### Strategy Category
| Property | Value |
|----------|-------|
| Font | Poppins, 12px, weight 600, uppercase |
| Letter spacing | 1px |
| Color | Energy state color (purple/rose/amber) |
| Margin top | 20px |

#### Strategy Title
| Property | Value |
|----------|-------|
| Font | Poppins, 22px, weight 600 |
| Color | `--text-primary` |
| Margin top | 8px |

#### Strategy Content
| Property | Value |
|----------|-------|
| Font | Poppins, 16px, weight 400 |
| Line height | 1.5 |
| Color | `--text-primary` |
| Margin top | 12px |
| Max width | 100% (no overflow) |

#### Source Citation
| Property | Value |
|----------|-------|
| Font | Poppins, 13px, weight 400 |
| Color | `--text-primary` at 60% opacity |
| Border top | 1px solid `--text-primary` at 15% |
| Padding top | 12px |
| Margin top | 16px |

#### Action Buttons
| Property | Value |
|----------|-------|
| Layout | Flex row, space-between |
| Margin top | 24px |
| Padding bottom | 24px + safe area |

**"Another" Button (Secondary)**
| Property | Value |
|----------|-------|
| Width | 48% |
| Height | 48px |
| Background | Transparent |
| Border | 2px solid `--text-primary` at 30% |
| Border radius | 24px |
| Text | "Another", 16px, weight 500 |

**"Done" Button (Primary)**
| Property | Value |
|----------|-------|
| Width | 48% |
| Height | 48px |
| Background | Current energy state color |
| Border radius | 24px |
| Text | "Done", 16px, weight 500 |
| Text color | White (or dark for amber) |

### Interaction Behaviors

| Action | Response |
|--------|----------|
| Tap "Show me a strategy" | Card slides up, Anchor dims to 40% |
| Swipe down on card | Card dismisses, returns to Anchor |
| Tap dimmed area | Card dismisses |
| Tap "Another" | Card content cross-fades to new strategy |
| Tap "Done" | Card dismisses with slide-down |
| Strategy shown | Random selection from current energy state pool |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Screen reader | Reads validation, then category, title, content, source |
| Focus order | Validation → Content → Another → Done |
| Dismiss gesture | Swipe down anywhere on card |
| Contrast | All text meets WCAG AA |

---

## 3. Onboarding Flow

### Flow Overview

```
[1. Welcome] → [2. How It Works] → [3. Your Name] → [4. Your Anchor] → [Anchor Screen]
```

### Screen 3.1: Welcome

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              🌅                         │  ← App icon/logo: 80x80px
│                                         │
│         gentle_loop                     │  ← App name: 32px
│                                         │
│    A moment of calm when                │  ← Tagline: 20px
│    you need it most.                    │
│                                         │
│                                         │
│    This app is your personal            │  ← Description: 16px
│    reset button. Open it when           │
│    caregiving gets heavy. We'll         │
│    help you pause, breathe, and         │
│    find your next step.                 │
│                                         │
│                                         │
│                                         │
│                                         │
│         ┌─────────────────────┐         │
│         │     Get Started     │         │  ← CTA: 56px height
│         └─────────────────────┘         │
│                                         │
│              ○ ○ ○ ○                    │  ← Progress dots
└─────────────────────────────────────────┘
```

### Screen 3.2: How It Works

```
┌─────────────────────────────────────────┐
│                                         │
│         How it works                    │  ← Title: 28px
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │  [Mini Anchor Screen Illustration]│  │  ← 200px illustration
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  1. Open the app                        │  ← Steps: 16px
│     See your anchor image. Take a       │
│     breath.                             │
│                                         │
│  2. Check your energy                   │
│     Slide to show how you're feeling.   │
│     No judgment, just information.      │
│                                         │
│  3. Get support                         │
│     Tap for a strategy matched to       │
│     your current state.                 │
│                                         │
│         ┌─────────────────────┐         │
│         │      Continue       │         │
│         └─────────────────────┘         │
│                                         │
│              ● ○ ○ ○                    │
└─────────────────────────────────────────┘
```

### Screen 3.3: Your Name

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         What should we call you?        │  ← Title: 28px
│                                         │
│         This helps us personalize       │  ← Subtitle: 16px
│         your experience.                │
│                                         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Your first name                  │  │  ← Input: 56px height
│  └───────────────────────────────────┘  │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│         ┌─────────────────────┐         │
│         │      Continue       │         │  ← Disabled until name entered
│         └─────────────────────┘         │
│                                         │
│              ● ● ○ ○                    │
└─────────────────────────────────────────┘
```

### Screen 3.4: Your Anchor

```
┌─────────────────────────────────────────┐
│                                         │
│         Choose your anchor              │  ← Title: 28px
│                                         │
│         This image will greet you       │  ← Subtitle: 16px
│         every time you open the app.    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │    ┌───────────┐  ┌───────────┐   │  │
│  │    │           │  │           │   │  │
│  │    │  Default  │  │  Upload   │   │  │  ← Two options
│  │    │  (nature) │  │  Photo    │   │  │     140x140px each
│  │    │     ✓     │  │           │   │  │
│  │    │           │  │    📷     │   │  │
│  │    └───────────┘  └───────────┘   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│    You can change this anytime in       │  ← Helper text: 14px
│    Settings.                            │
│                                         │
│         ┌─────────────────────┐         │
│         │    Start Using      │         │
│         └─────────────────────┘         │
│                                         │
│    Skip for now                         │  ← Skip link: 14px underline
│                                         │
│              ● ● ● ○                    │
└─────────────────────────────────────────┘
```

### Onboarding Specifications

| Element | Specification |
|---------|---------------|
| Background | `--bg-primary` (warm cream) |
| Progress dots | 8px circles, active = `--energy-warming` |
| Navigation | Swipe OR button tap |
| Skip option | Only on "Your Anchor" screen |
| Total time | Target: < 60 seconds |
| Exit point | Directly to Anchor Screen |

---

## 4. Settings Screen

### Layout Specification

```
┌─────────────────────────────────────────┐
│ ←  Settings                             │  ← Header with back arrow
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ PERSONALIZATION                   │  │  ← Section header
│  │ ─────────────────────────────────  │  │
│  │                                   │  │
│  │ Your Name                    [→]  │  │  ← Tap to edit
│  │ David                             │  │
│  │                                   │  │
│  │ Anchor Image                 [→]  │  │  ← Tap to change
│  │ Custom photo                      │  │
│  │                                   │  │
│  │ Anchor Video                 [→]  │  │  ← Tap to upload
│  │ Not set                           │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ACCESSIBILITY                     │  │
│  │ ─────────────────────────────────  │  │
│  │                                   │  │
│  │ Reduce Motion              [OFF]  │  │  ← Toggle switch
│  │ Disables animations               │  │
│  │                                   │  │
│  │ Larger Text                [OFF]  │  │  ← Toggle switch
│  │ Increases font sizes              │  │
│  │                                   │  │
│  │ High Contrast              [OFF]  │  │  ← Toggle switch
│  │ Improves visibility               │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ABOUT                             │  │
│  │ ─────────────────────────────────  │  │
│  │                                   │  │
│  │ Version                    1.0.0  │  │
│  │ Privacy Policy               [→]  │  │
│  │ Send Feedback                [→]  │  │
│  │                                   │  │
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

### Personalization Sub-screens

**Change Anchor Image**
- Photo library access
- Camera option
- Preview before confirming
- "Remove custom image" option to revert to default

**Upload Anchor Video**
- Video library access
- Max duration: 10 seconds (auto-trim)
- Video plays silently on loop
- Falls back to image if video fails

---

## 5. Voice Input Modal

### Layout Specification

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
│           ┌─────────────┐               │
│           │             │               │
│           │     🎤      │               │  ← Mic icon: 64px
│           │  (pulsing)  │               │     Pulsing animation
│           │             │               │
│           └─────────────┘               │
│                                         │
│         "Listening..."                  │  ← Status: 20px
│                                         │
│    ┌─────────────────────────────┐      │
│    │ "She keeps asking the same │      │  ← Live transcription
│    │  question over and over..." │      │     16px, appears as spoken
│    └─────────────────────────────┘      │
│                                         │
│                                         │
│         ┌─────────────────────┐         │
│         │       Cancel        │         │  ← Secondary button
│         └─────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

### Voice Input Specifications

| Element | Specification |
|---------|---------------|
| Background | Dimmed overlay (40% black) |
| Modal | Centered, 90% width, rounded corners |
| Mic animation | Pulsing ring when active |
| Transcription | Real-time display of speech |
| Auto-submit | After 2 seconds of silence |
| Cancel | Dismisses and returns to previous state |
| Result | Voice context influences strategy selection |

---

## Responsive Considerations

### Screen Size Adaptations

| Screen Size | Adaptations |
|-------------|-------------|
| **Small (< 375px)** | Anchor image 240px, reduced margins |
| **Standard (375-414px)** | Default specifications |
| **Large (> 414px)** | Anchor image 320px, increased spacing |
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
| Strategy card slide up | 400ms | ease-out |
| Strategy card dismiss | 300ms | ease-in |
| Content cross-fade | 300ms | ease-in-out |
| Anchor image fade-in | 600ms | ease-out |

### Micro-interactions

| Element | Animation |
|---------|-----------|
| Anchor breathing pulse | scale 1.0→1.02→1.0, 4s loop |
| Button press | scale 0.98, 100ms |
| Slider thumb | spring physics on release |
| Mic recording | pulsing ring, 1s loop |

### Reduce Motion Mode

When enabled:
- No breathing pulse
- Instant state changes (no fades)
- No scale animations
- Slide replaced with fade

---

## Next Steps

1. **Review wireframes** — Confirm layout and interactions
2. **Create high-fidelity mockups** — Apply full visual design
3. **Prototype key flows** — Validate interactions
4. **Technical architecture** — Begin development planning
