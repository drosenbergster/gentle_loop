# Epic 3: Energy-Aware Routing & Timer Flow (Stories 3.1, 3.2, 3.3)

Status: review

## Stories

### Story 3.1: "Running Low" AI Routing — Permission & Breathing Suggestion
### Story 3.2: Breathing Timer with Auto Follow-Up
### Story 3.3: Active Engagement Override

## Acceptance Criteria Completed

### Story 3.1
- [x] When energy="running_low" and response_type="pause", breathing timer activates (FR14)
- [x] Pause suggestion displayed on card first (2s reading time), then breathing overlay
- [x] "Holding steady" and "I've got this" → unchanged behavior, immediate suggestion (FR16)
- [x] No breathing for non-pause response types even when running_low
- [x] Breathing not re-triggered on timer_follow_up responses

### Story 3.2
- [x] Breathing circle: 120px, energy color stroke, 5% fill, scale 0.8↔1.0 on 4s cycle (UX-6)
- [x] Timer: 90 seconds default, "X:XX remaining" display
- [x] Skip button: prominent Pressable with border, min 44px height, not a small text link (UFG-9)
- [x] Mic button accessible during timer (UFG-3) — mic press cancels timer
- [x] Timer expiry → auto `timer_follow_up` request (FR15)
- [x] Skip → also sends `timer_follow_up` request
- [x] App resume after timer expired → fires follow-up immediately (FM-9)
- [x] Reduce Motion → static circle (no animation) with countdown (UX-8)
- [x] Anchor image visible behind breathing overlay (UX-2)

### Story 3.3
- [x] "Another" tap cancels breathing timer, sends "another" request (FR17)
- [x] Mic press cancels breathing timer, proceeds with voice recording
- [x] Card mic press also cancels breathing timer
- [x] Dismiss cancels breathing timer
- [x] Breathing only on initial response in thread when AI suggests pause, not on every response

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **BreathingOverlay** (`src/components/anchor/BreathingOverlay.tsx`): Animated breathing circle using Reanimated. 120px circle with energy color stroke and 5% fill. Scale oscillates 0.8↔1.0 on 4s cycle. Timer counts down from 90s with `setInterval`. Skip button is a full-sized Pressable with border (UFG-9). AppState listener handles resume-after-background (FM-9). `pointerEvents="box-none"` allows mic button interaction through overlay.
- **Anchor Screen integration** (`app/index.tsx`): When `response_type === 'pause'` and `energyLevel === 'running_low'` and not a `timer_follow_up`, card shows for 2s then breathing overlay activates. `handleBreathingExpired` and `handleBreathingSkip` both send `timer_follow_up`. `cancelBreathing()` called from: handleAnother, handleDismiss, handleMicPressIn, handleCardMicPressIn.

### Change Log
- Created `src/components/anchor/BreathingOverlay.tsx` — breathing timer component
- Updated `src/components/anchor/index.ts` — added BreathingOverlay export
- Updated `app/index.tsx` — integrated breathing timer, cancel-on-engage, timer_follow_up
- Created `__tests__/breathing-timer.test.ts` — 19 tests

### File List
- `app/src/components/anchor/BreathingOverlay.tsx` (new)
- `app/src/components/anchor/index.ts` (modified)
- `app/app/index.tsx` (modified)
- `app/__tests__/breathing-timer.test.ts` (new)
